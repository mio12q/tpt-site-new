import fs from 'node:fs';
import path from 'node:path';
import type {
  AdminUser,
  Article,
  AuthorProfile,
  PseoCategory,
  PseoPage,
  SectionInfo,
  SectionSlug,
} from '../domain/types';
import { ARTICLES, AUTHORS, BRAND_CONFIG, SECTIONS } from '../data/editorial-data';
import {
  CORE_PSEO_PAGES,
  getAllSitemapEntries,
  getSampleMatrixPages,
  getSitemapChunks,
  getTotalProgrammaticPageCount,
  resolveDynamicPseoPage,
} from '../data/pseo-engine';
import {
  embedOwnershipWatermark,
  validateAndSanitizeCmsSnapshot,
} from '../security';
import {
  type PgQueryExecutor,
  assertProductionDatabaseUrl,
  getSharedPostgresPool,
} from '../db/postgres-pool';
import { PostgresPublicationRepository } from '../repositories/postgres-publication-repository';

// ---------------------------------------------------------------------------
// Decoupled Data Repository Interface (PostgreSQL-Ready Abstraction)
// All UI pages and API routes call this service layer rather than direct data.
// Supports full CRUD for Articles, Authors/Reviewers, Categories/Sections,
// and pSEO Templates so placeholders can be replaced via /secretadmin2026here.
// ---------------------------------------------------------------------------

export interface IPublicationRepository {
  getSections(): SectionInfo[];
  getSectionBySlug(slug: string): SectionInfo | undefined;
  saveSection(section: SectionInfo): SectionInfo;

  getAllArticles(): Article[];
  getArticleBySlug(slug: string): Article | undefined;
  getArticlesBySection(sectionSlug: SectionSlug): Article[];
  getLeadArticle(): Article;
  getSecondaryArticles(): Article[];
  getBreakingArticles(): Article[];
  getOpinionArticles(): Article[];
  getMostReadArticles(): Article[];
  createOrUpdateArticle(article: Article): Article;
  deleteArticle(slug: string): boolean;

  getAllTags(): { tag: string; slug: string; count: number }[];
  getArticlesByTag(tagSlug: string): { tagLabel: string; articles: Article[] };

  getAuthors(): AuthorProfile[];
  getAuthorBySlug(slug: string): AuthorProfile | undefined;
  saveAuthor(author: AuthorProfile): AuthorProfile;
  deleteAuthor(slug: string): boolean;

  getCorePseoPages(category?: PseoCategory): PseoPage[];
  getPseoPage(categoryRoute: string, slug: string): PseoPage | null;
  saveCorePseoPage(page: PseoPage): PseoPage;

  searchPublication(query: string, limit?: number): {
    articles: Article[];
    pseoPages: PseoPage[];
  };

  exportStateSnapshot(): CmsPersistentState;
  importStateSnapshot(snapshot: Partial<CmsPersistentState>): CmsPersistentState;
}

export interface CmsPersistentState {
  articles: Article[];
  authors: AuthorProfile[];
  sections: SectionInfo[];
  corePseoPages: PseoPage[];
}

const CMS_STORE_PATH = path.join(process.cwd(), '.cms-store.json');

export function loadPersistentState(): CmsPersistentState {
  try {
    if (fs.existsSync(CMS_STORE_PATH)) {
      const raw = fs.readFileSync(CMS_STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Partial<CmsPersistentState>;
      return {
        articles: Array.isArray(parsed.articles) && parsed.articles.length > 0 ? parsed.articles : [...ARTICLES],
        authors: Array.isArray(parsed.authors) && parsed.authors.length > 0 ? parsed.authors : [...AUTHORS],
        sections: Array.isArray(parsed.sections) && parsed.sections.length > 0 ? parsed.sections : [...SECTIONS],
        corePseoPages:
          Array.isArray(parsed.corePseoPages) && parsed.corePseoPages.length > 0
            ? parsed.corePseoPages
            : [...CORE_PSEO_PAGES],
      };
    }
  } catch {
    // Fallback to in-memory seed if disk read fails
  }
  return {
    articles: [...ARTICLES],
    authors: [...AUTHORS],
    sections: [...SECTIONS],
    corePseoPages: [...CORE_PSEO_PAGES],
  };
}

function savePersistentState(state: CmsPersistentState): void {
  try {
    fs.writeFileSync(CMS_STORE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Ignore write errors in read-only environments; in-memory state remains active
  }
}

const cmsState: CmsPersistentState = loadPersistentState();

export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export class JsonFilePublicationRepository implements IPublicationRepository {
  getSections(): SectionInfo[] {
    return [...cmsState.sections];
  }

  getSectionBySlug(slug: string): SectionInfo | undefined {
    return cmsState.sections.find((s) => s.slug === slug);
  }

  saveSection(section: SectionInfo): SectionInfo {
    const idx = cmsState.sections.findIndex((s) => s.slug === section.slug);
    if (idx >= 0) {
      cmsState.sections[idx] = section;
    } else {
      cmsState.sections.push(section);
    }
    savePersistentState(cmsState);
    return section;
  }

  getAllArticles(): Article[] {
    return [...cmsState.articles].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  getArticleBySlug(slug: string): Article | undefined {
    const found = cmsState.articles.find((a) => a.slug === slug);
    if (!found) return undefined;
    // Embed subtle zero-width cryptographic ownership watermark in opening paragraph
    const watermarkedBody = found.body.map((block, idx) => {
      if (idx === 0 && block.paragraphs.length > 0) {
        return {
          ...block,
          paragraphs: [
            embedOwnershipWatermark(block.paragraphs[0], found.slug),
            ...block.paragraphs.slice(1),
          ],
        };
      }
      return block;
    });
    return {
      ...found,
      body: watermarkedBody,
    };
  }

  getArticlesBySection(sectionSlug: SectionSlug): Article[] {
    if (sectionSlug === 'latest-news') {
      return this.getAllArticles();
    }
    const filtered = cmsState.articles.filter((a) => a.section === sectionSlug);
    return filtered.length > 0 ? filtered : this.getAllArticles().slice(0, 4);
  }

  getLeadArticle(): Article {
    return cmsState.articles.find((a) => a.isFeaturedLead) || cmsState.articles[0];
  }

  getSecondaryArticles(): Article[] {
    return cmsState.articles.filter((a) => a.isSecondaryLead && !a.isFeaturedLead);
  }

  getBreakingArticles(): Article[] {
    return this.getAllArticles();
  }

  getOpinionArticles(): Article[] {
    return cmsState.articles.filter((a) => a.section === 'opinion' || a.isOpinion);
  }

  getMostReadArticles(): Article[] {
    return [...cmsState.articles]
      .filter((a) => typeof a.mostReadRank === 'number')
      .sort((a, b) => (a.mostReadRank || 99) - (b.mostReadRank || 99));
  }

  getAllTags(): { tag: string; slug: string; count: number }[] {
    const map = new Map<string, { tag: string; slug: string; count: number }>();
    for (const art of cmsState.articles) {
      for (const rawTag of art.tags) {
        const s = slugifyTag(rawTag);
        if (!s) continue;
        const existing = map.get(s);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(s, { tag: rawTag, slug: s, count: 1 });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }

  getArticlesByTag(tagSlug: string): { tagLabel: string; articles: Article[] } {
    const normalized = tagSlug.toLowerCase();
    let label = tagSlug.replace(/-/g, ' ');
    const matched = cmsState.articles.filter((art) =>
      art.tags.some((t) => {
        const s = slugifyTag(t);
        if (s === normalized) {
          label = t;
          return true;
        }
        return false;
      })
    );
    return {
      tagLabel: label,
      articles: matched.length > 0 ? matched : this.getAllArticles().slice(0, 3),
    };
  }

  getAuthors(): AuthorProfile[] {
    return [...cmsState.authors];
  }

  getAuthorBySlug(slug: string): AuthorProfile | undefined {
    return cmsState.authors.find((a) => a.slug === slug) || cmsState.authors[0];
  }

  saveAuthor(author: AuthorProfile): AuthorProfile {
    const idx = cmsState.authors.findIndex((a) => a.slug === author.slug);
    if (idx >= 0) {
      cmsState.authors[idx] = author;
    } else {
      cmsState.authors.push(author);
    }
    savePersistentState(cmsState);
    return author;
  }

  deleteAuthor(slug: string): boolean {
    if (cmsState.authors.length <= 1) return false;
    const before = cmsState.authors.length;
    cmsState.authors = cmsState.authors.filter((a) => a.slug !== slug);
    savePersistentState(cmsState);
    return cmsState.authors.length < before;
  }

  getCorePseoPages(category?: PseoCategory): PseoPage[] {
    if (!category) return [...cmsState.corePseoPages];
    return cmsState.corePseoPages.filter((p) => p.category === category);
  }

  getPseoPage(categoryRoute: string, slug: string): PseoPage | null {
    // First check customized core pSEO pages in cmsState
    const customMatch = cmsState.corePseoPages.find((p) => p.slug === slug);
    if (customMatch) return customMatch;
    return resolveDynamicPseoPage(categoryRoute, slug);
  }

  saveCorePseoPage(page: PseoPage): PseoPage {
    const idx = cmsState.corePseoPages.findIndex((p) => p.slug === page.slug);
    if (idx >= 0) {
      cmsState.corePseoPages[idx] = page;
    } else {
      cmsState.corePseoPages.unshift(page);
    }
    savePersistentState(cmsState);
    return page;
  }

  searchPublication(
    query: string,
    limit: number = 10
  ): { articles: Article[]; pseoPages: PseoPage[] } {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        articles: this.getAllArticles().slice(0, 5),
        pseoPages: cmsState.corePseoPages.slice(0, 5),
      };
    }
    const articles = cmsState.articles
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, limit);
    const pseoPages = cmsState.corePseoPages
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.clinicalSummary.toLowerCase().includes(q)
      )
      .slice(0, limit);
    return { articles, pseoPages };
  }

  createOrUpdateArticle(article: Article): Article {
    if (article.isFeaturedLead) {
      cmsState.articles = cmsState.articles.map((a) =>
        a.slug === article.slug ? a : { ...a, isFeaturedLead: false }
      );
    }
    const idx = cmsState.articles.findIndex((a) => a.slug === article.slug);
    if (idx >= 0) {
      cmsState.articles[idx] = article;
    } else {
      cmsState.articles.unshift(article);
    }
    savePersistentState(cmsState);
    return article;
  }

  deleteArticle(slug: string): boolean {
    if (cmsState.articles.length <= 1) return false;
    const before = cmsState.articles.length;
    cmsState.articles = cmsState.articles.filter((a) => a.slug !== slug);
    savePersistentState(cmsState);
    return cmsState.articles.length < before;
  }

  exportStateSnapshot(): CmsPersistentState {
    return {
      articles: [...cmsState.articles],
      authors: [...cmsState.authors],
      sections: [...cmsState.sections],
      corePseoPages: [...cmsState.corePseoPages],
    };
  }

  importStateSnapshot(snapshot: Partial<CmsPersistentState>): CmsPersistentState {
    const validation = validateAndSanitizeCmsSnapshot(snapshot);
    if (!validation.valid || !validation.sanitized) {
      throw new Error(validation.error || 'Invalid CMS snapshot.');
    }
    const clean = validation.sanitized;
    if (clean.articles && clean.articles.length > 0) {
      cmsState.articles = clean.articles;
    }
    if (clean.authors && clean.authors.length > 0) {
      cmsState.authors = clean.authors;
    }
    if (clean.sections && clean.sections.length > 0) {
      cmsState.sections = clean.sections;
    }
    if (clean.corePseoPages && clean.corePseoPages.length > 0) {
      cmsState.corePseoPages = clean.corePseoPages;
    }
    savePersistentState(cmsState);
    return this.exportStateSnapshot();
  }
}

/**
 * Factory that switches automatically between `.cms-store.json` (`JsonFilePublicationRepository`)
 * and PostgreSQL (`PostgresPublicationRepository`) depending on whether `DATABASE_URL` is set.
 *
 * In production (`NODE_ENV=production` at runtime), if `DATABASE_URL` is missing, this fails
 * immediately with a clear error instead of silently falling back to `.cms-store.json`.
 */
export function createPublicationRepository(
  env: Record<string, string | undefined> = process.env,
  customPool?: PgQueryExecutor
): IPublicationRepository {
  assertProductionDatabaseUrl(env);

  const dbUrl = (env.DATABASE_URL || '').trim();
  if (dbUrl || customPool) {
    const pool = customPool || getSharedPostgresPool(env);
    return new PostgresPublicationRepository(pool, cmsState);
  }

  return new JsonFilePublicationRepository();
}

let activeRepositoryInstance: IPublicationRepository | null = null;

function getActiveRepository(): IPublicationRepository {
  if (!activeRepositoryInstance) {
    activeRepositoryInstance = createPublicationRepository(process.env);
  }
  return activeRepositoryInstance;
}

export function resetActiveRepositoryForTesting(): void {
  activeRepositoryInstance = null;
}

/**
 * Resolves an admin user for authentication.
 * - In production (`NODE_ENV=production`), `ALLOW_DEMO_ADMIN` is completely ignored;
 *   authentication succeeds ONLY against admin users stored in PostgreSQL (`admin_users`),
 *   created by the seed script with a password typed at runtime. Fails closed otherwise.
 * - In local development without `DATABASE_URL`, allows a local account ONLY if
 *   `ALLOW_DEMO_ADMIN=true` is explicitly set in `.env.local` along with `ADMIN_PASSWORD_HASH`.
 */
export async function findAdminUserForAuth(
  username: string,
  env: Record<string, string | undefined> = process.env,
  customPool?: PgQueryExecutor
): Promise<AdminUser | undefined> {
  const cleanUsername = (username || '').trim();
  if (!cleanUsername) return undefined;

  const isProd = env.NODE_ENV === 'production';
  const dbUrl = (env.DATABASE_URL || '').trim();

  if (isProd) {
    assertProductionDatabaseUrl(env);
    try {
      const repo = customPool
        ? new PostgresPublicationRepository(customPool, cmsState)
        : getActiveRepository();
      if (repo instanceof PostgresPublicationRepository) {
        const dbUser = await repo.findAdminUserByUsernameInDb(cleanUsername);
        return dbUser || undefined;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  if (dbUrl || customPool) {
    try {
      const repo = customPool
        ? new PostgresPublicationRepository(customPool, cmsState)
        : getActiveRepository();
      if (repo instanceof PostgresPublicationRepository) {
        const dbUser = await repo.findAdminUserByUsernameInDb(cleanUsername);
        return dbUser || undefined;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  // Local development without DATABASE_URL: fail closed unless ALLOW_DEMO_ADMIN=true is explicitly set
  if (env.ALLOW_DEMO_ADMIN === 'true') {
    const envPasswordHash = (env.ADMIN_PASSWORD_HASH || '').trim();
    const expectedUsername = (env.ADMIN_USERNAME || 'admin').trim();
    if (
      envPasswordHash &&
      cleanUsername.toLowerCase() === expectedUsername.toLowerCase()
    ) {
      return {
        id: 'local-dev-admin',
        username: expectedUsername,
        displayName: '[Admin Name], [Credentials]',
        role: 'admin',
        passwordHash: envPasswordHash,
        totpEnabled: Boolean((env.ADMIN_TOTP_SECRET || '').trim()),
      };
    }
  }

  return undefined;
}

export const publicationService: IPublicationRepository = {
  getSections: () => getActiveRepository().getSections(),
  getSectionBySlug: (slug) => getActiveRepository().getSectionBySlug(slug),
  saveSection: (section) => getActiveRepository().saveSection(section),
  getAllArticles: () => getActiveRepository().getAllArticles(),
  getArticleBySlug: (slug) => getActiveRepository().getArticleBySlug(slug),
  getArticlesBySection: (sectionSlug) => getActiveRepository().getArticlesBySection(sectionSlug),
  getLeadArticle: () => getActiveRepository().getLeadArticle(),
  getSecondaryArticles: () => getActiveRepository().getSecondaryArticles(),
  getBreakingArticles: () => getActiveRepository().getBreakingArticles(),
  getOpinionArticles: () => getActiveRepository().getOpinionArticles(),
  getMostReadArticles: () => getActiveRepository().getMostReadArticles(),
  createOrUpdateArticle: (article) => getActiveRepository().createOrUpdateArticle(article),
  deleteArticle: (slug) => getActiveRepository().deleteArticle(slug),
  getAllTags: () => getActiveRepository().getAllTags(),
  getArticlesByTag: (tagSlug) => getActiveRepository().getArticlesByTag(tagSlug),
  getAuthors: () => getActiveRepository().getAuthors(),
  getAuthorBySlug: (slug) => getActiveRepository().getAuthorBySlug(slug),
  saveAuthor: (author) => getActiveRepository().saveAuthor(author),
  deleteAuthor: (slug) => getActiveRepository().deleteAuthor(slug),
  getCorePseoPages: (category) => getActiveRepository().getCorePseoPages(category),
  getPseoPage: (categoryRoute, slug) => getActiveRepository().getPseoPage(categoryRoute, slug),
  saveCorePseoPage: (page) => getActiveRepository().saveCorePseoPage(page),
  searchPublication: (query, limit) => getActiveRepository().searchPublication(query, limit),
  exportStateSnapshot: () => getActiveRepository().exportStateSnapshot(),
  importStateSnapshot: (snapshot) => getActiveRepository().importStateSnapshot(snapshot),
};

export {
  PostgresPublicationRepository,
  BRAND_CONFIG,
  getAllSitemapEntries,
  getSampleMatrixPages,
  getSitemapChunks,
  getTotalProgrammaticPageCount,
};


export async function ensurePublicationHydrated(): Promise<void> {
  const repo = getActiveRepository();
  if (repo instanceof PostgresPublicationRepository) {
    await repo.hydrateFromDatabase();
  }
}
