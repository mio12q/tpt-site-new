import type {
  AdminUser,
  Article,
  AuditLogEntry,
  AuthorProfile,
  PseoCategory,
  PseoPage,
  SectionInfo,
  SectionSlug,
} from '../domain/types';
import { ARTICLES, AUTHORS, SECTIONS } from '../data/editorial-data';
import { CORE_PSEO_PAGES, resolveDynamicPseoPage } from '../data/pseo-engine';
import {
  embedOwnershipWatermark,
  validateAndSanitizeCmsSnapshot,
} from '../security';
import {
  type PgQueryExecutor,
  getSharedPostgresPool,
  sanitizeDatabaseError,
} from '../db/postgres-pool';
import type {
  CmsPersistentState,
  IPublicationRepository,
} from '../services/publication-service';

function slugifyTagInternal(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseJsonColumn<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return raw as T;
}

function toIsoDateString(val: unknown): string {
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'string' && val.trim()) {
    return val;
  }
  return new Date().toISOString();
}

export function mapRowToSection(row: Record<string, any>): SectionInfo {
  return {
    slug: String(row.slug) as SectionSlug,
    name: String(row.name),
    shortName: String(row.short_name ?? row.shortName ?? row.name),
    description: String(row.description),
    leadNote: String(row.lead_note ?? row.leadNote ?? `${row.name} Desk`),
  };
}

export function mapRowToAuthor(row: Record<string, any>): AuthorProfile {
  return {
    slug: String(row.slug),
    name: String(row.name),
    credentials: String(row.credentials),
    role: String(row.role),
    institution: String(row.institution),
    bio: String(row.bio),
    education: parseJsonColumn<string[]>(row.education, []),
    clinicalSpecialties: parseJsonColumn<string[]>(
      row.clinical_specialties ?? row.clinicalSpecialties,
      []
    ),
    peerReviewedPublications: Number(
      row.peer_reviewed_publications ?? row.peerReviewedPublications ?? 0
    ),
    conflictOfInterestDisclosure: String(
      row.conflict_of_interest_disclosure ??
        row.conflictOfInterestDisclosure ??
        '[Conflict of Interest Disclosure Placeholder]'
    ),
    isMedicalReviewer: Boolean(row.is_medical_reviewer ?? row.isMedicalReviewer),
    orcid: String(row.orcid ?? '[0000-0000-0000-0000]'),
  };
}

export function mapRowToArticle(row: Record<string, any>): Article {
  return {
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle),
    excerpt: String(row.excerpt ?? row.subtitle),
    section: String(row.section_slug ?? row.section) as SectionSlug,
    authorSlug: String(row.author_slug ?? row.authorSlug),
    reviewerSlug: String(row.reviewer_slug ?? row.reviewerSlug),
    publishedAt: toIsoDateString(row.published_at ?? row.publishedAt),
    updatedAt: toIsoDateString(row.updated_at ?? row.updatedAt),
    lastReviewedAt: toIsoDateString(row.last_reviewed_at ?? row.lastReviewedAt),
    readingTimeMinutes: Number(row.reading_time_minutes ?? row.readingTimeMinutes ?? 6),
    isBreaking: Boolean(row.is_breaking ?? row.isBreaking),
    isFeaturedLead: Boolean(row.is_featured_lead ?? row.isFeaturedLead),
    isSecondaryLead: Boolean(row.is_secondary_lead ?? row.isSecondaryLead),
    isOpinion: Boolean(row.is_opinion ?? row.isOpinion),
    mostReadRank:
      row.most_read_rank !== null && row.most_read_rank !== undefined
        ? Number(row.most_read_rank)
        : row.mostReadRank !== undefined
          ? Number(row.mostReadRank)
          : undefined,
    locationDateline: String(row.location_dateline ?? row.locationDateline ?? '[DATELINE]'),
    pullQuote: parseJsonColumn(row.pull_quote ?? row.pullQuote, {
      quote: String(row.subtitle ?? ''),
      attribution: '[Quote Attribution Placeholder]',
    }),
    keyTakeaways: parseJsonColumn<string[]>(row.key_takeaways ?? row.keyTakeaways, []),
    body: parseJsonColumn(row.body, []),
    figure: parseJsonColumn(row.figure, {
      id: `fig-${row.slug}`,
      type: 'clinical-trial-chart' as const,
      title: '[Figure Title Placeholder]',
      subtitle: '[Figure Subtitle Placeholder]',
      caption: '[Figure Caption Placeholder]',
      credit: '[Source Credit Placeholder]',
      dataPoints: [],
    }),
    primarySources: parseJsonColumn(row.primary_sources ?? row.primarySources, []),
    tags: parseJsonColumn<string[]>(row.tags, []),
    relatedArticleSlugs: parseJsonColumn<string[]>(
      row.related_article_slugs ?? row.relatedArticleSlugs,
      []
    ),
    relatedPseoSlugs: parseJsonColumn<string[]>(
      row.related_pseo_slugs ?? row.relatedPseoSlugs,
      []
    ),
  };
}

export function mapRowToPseoPage(row: Record<string, any>): PseoPage {
  return {
    slug: String(row.slug),
    category: String(row.category) as PseoCategory,
    urlPath: String(row.url_path ?? row.urlPath),
    title: String(row.title),
    subtitle: String(row.subtitle),
    metaTitle: String(row.meta_title ?? row.metaTitle ?? row.title),
    metaDescription: String(row.meta_description ?? row.metaDescription ?? row.subtitle),
    canonicalUrl: String(row.canonical_url ?? row.canonicalUrl),
    dsmOrIcdCode:
      row.dsm_or_icd_code ?? row.dsmOrIcdCode
        ? String(row.dsm_or_icd_code ?? row.dsmOrIcdCode)
        : undefined,
    evidenceGrade:
      row.evidence_grade ?? row.evidenceGrade
        ? String(row.evidence_grade ?? row.evidenceGrade)
        : undefined,
    lastReviewedAt: toIsoDateString(row.last_reviewed_at ?? row.lastReviewedAt),
    updatedAt: toIsoDateString(row.updated_at ?? row.updatedAt),
    reviewerSlug: String(row.reviewer_slug ?? row.reviewerSlug ?? 'reviewer-placeholder'),
    authorSlug: String(row.author_slug ?? row.authorSlug ?? 'author-placeholder'),
    clinicalSummary: String(row.clinical_summary ?? row.clinicalSummary),
    neurobiologicalMechanism: String(
      row.neurobiological_mechanism ?? row.neurobiologicalMechanism
    ),
    diagnosticOrClinicalCriteria: parseJsonColumn<string[]>(
      row.diagnostic_or_clinical_criteria ?? row.diagnosticOrClinicalCriteria,
      []
    ),
    epidemiologyAndMetrics: parseJsonColumn(
      row.epidemiology_and_metrics ?? row.epidemiologyAndMetrics,
      []
    ),
    treatmentOrClinicalProtocols: parseJsonColumn(
      row.treatment_or_clinical_protocols ?? row.treatmentOrClinicalProtocols,
      []
    ),
    faqs: parseJsonColumn(row.faqs, []),
    primarySources: parseJsonColumn(row.primary_sources ?? row.primarySources, []),
    relatedPseoPaths: parseJsonColumn(
      row.related_pseo_paths ?? row.relatedPseoPaths,
      []
    ),
    relatedArticleSlugs: parseJsonColumn<string[]>(
      row.related_article_slugs ?? row.relatedArticleSlugs,
      []
    ),
  };
}

export function mapRowToAdminUser(row: Record<string, any>): AdminUser {
  return {
    id: String(row.id),
    username: String(row.username),
    displayName: String(row.display_name ?? row.displayName),
    role: String(row.role) as AdminUser['role'],
    passwordHash: String(row.password_hash ?? row.passwordHash),
    totpEnabled: Boolean(row.totp_enabled ?? row.totpEnabled),
    lastLoginAt:
      row.last_login_at || row.lastLoginAt
        ? toIsoDateString(row.last_login_at ?? row.lastLoginAt)
        : undefined,
  };
}

/**
 * PostgreSQL implementation of IPublicationRepository.
 * - Uses strictly parameterized SQL queries ($1, $2, ...) via `pg` Pool.
 * - Operates under the least-privilege `tpt_app_user` role (SELECT, INSERT, UPDATE, DELETE only; no DDL).
 * - Never logs DATABASE_URL, passwords, or SQL bind parameter values.
 * - Maintains a synchronized write-through cache hydrated from PostgreSQL so all existing
 *   synchronous UI/service calls in Next.js components work with zero UI changes while
 *   also exposing direct async SQL methods.
 */
export class PostgresPublicationRepository implements IPublicationRepository {
  private readonly pool: PgQueryExecutor;
  private state: CmsPersistentState;
  private hydrationPromise: Promise<void> | null = null;

  constructor(pool?: PgQueryExecutor, initialSeed?: CmsPersistentState) {
    this.pool = pool || getSharedPostgresPool();
    this.state = initialSeed
      ? {
          articles: [...initialSeed.articles],
          authors: [...initialSeed.authors],
          sections: [...initialSeed.sections],
          corePseoPages: [...initialSeed.corePseoPages],
        }
      : {
          articles: [...ARTICLES],
          authors: [...AUTHORS],
          sections: [...SECTIONS],
          corePseoPages: [...CORE_PSEO_PAGES],
        };

    // Trigger non-blocking initial hydration from PostgreSQL
    this.hydrationPromise = this.hydrateFromDatabase().catch((err) => {
      console.error(
        '[PostgresPublicationRepository] Initial hydration warning:',
        sanitizeDatabaseError(err)
      );
    });
  }

  private runBackgroundQuery(promise: Promise<unknown>, contextLabel: string): void {
    promise.catch((err) => {
      console.error(
        `[PostgresPublicationRepository] ${contextLabel} error:`,
        sanitizeDatabaseError(err)
      );
    });
  }

  /**
   * Hydrates in-memory state from PostgreSQL using parameterized SELECT queries.
   */
  async hydrateFromDatabase(): Promise<void> {
    const [sectionsRes, authorsRes, articlesRes, pseoRes] = await Promise.all([
      this.pool.query(
        'SELECT slug, name, short_name, description, lead_note FROM sections ORDER BY slug ASC'
      ),
      this.pool.query(
        `SELECT slug, name, credentials, role, institution, bio, education,
                clinical_specialties, peer_reviewed_publications,
                conflict_of_interest_disclosure, is_medical_reviewer, orcid
         FROM authors
         ORDER BY slug ASC`
      ),
      this.pool.query(
        `SELECT slug, title, subtitle, excerpt, section_slug, author_slug, reviewer_slug,
                published_at, updated_at, last_reviewed_at, reading_time_minutes,
                is_breaking, is_featured_lead, is_secondary_lead, is_opinion,
                most_read_rank, location_dateline, pull_quote, key_takeaways,
                body, figure, primary_sources, tags, related_article_slugs, related_pseo_slugs
         FROM articles
         ORDER BY published_at DESC`
      ),
      this.pool.query(
        `SELECT slug, category, url_path, title, subtitle, meta_title, meta_description,
                canonical_url, dsm_or_icd_code, evidence_grade, last_reviewed_at, updated_at,
                reviewer_slug, author_slug, clinical_summary, neurobiological_mechanism,
                diagnostic_or_clinical_criteria, epidemiology_and_metrics,
                treatment_or_clinical_protocols, faqs, primary_sources,
                related_pseo_paths, related_article_slugs
         FROM pseo_pages
         ORDER BY slug ASC`
      ),
    ]);

    if (sectionsRes.rows.length > 0) {
      this.state.sections = sectionsRes.rows.map(mapRowToSection);
    }
    if (authorsRes.rows.length > 0) {
      this.state.authors = authorsRes.rows.map(mapRowToAuthor);
    }
    if (articlesRes.rows.length > 0) {
      this.state.articles = articlesRes.rows.map(mapRowToArticle);
    }
    if (pseoRes.rows.length > 0) {
      this.state.corePseoPages = pseoRes.rows.map(mapRowToPseoPage);
    }
  }

  async ensureHydrated(): Promise<void> {
    if (this.hydrationPromise) {
      await this.hydrationPromise;
    }
  }

  // =========================================================================
  // PARAMETERIZED ASYNC SQL OPERATIONS (SELECT / INSERT / UPDATE / DELETE)
  // =========================================================================

  async querySectionsFromDb(): Promise<SectionInfo[]> {
    const res = await this.pool.query(
      'SELECT slug, name, short_name, description, lead_note FROM sections ORDER BY slug ASC'
    );
    const sections = res.rows.map(mapRowToSection);
    if (sections.length > 0) {
      this.state.sections = sections;
    }
    return sections;
  }

  async querySectionBySlugFromDb(slug: string): Promise<SectionInfo | undefined> {
    const res = await this.pool.query(
      'SELECT slug, name, short_name, description, lead_note FROM sections WHERE slug = $1 LIMIT 1',
      [slug]
    );
    return res.rows[0] ? mapRowToSection(res.rows[0]) : undefined;
  }

  async upsertSectionInDb(section: SectionInfo): Promise<SectionInfo> {
    await this.pool.query(
      `INSERT INTO sections (slug, name, short_name, description, lead_note, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         short_name = EXCLUDED.short_name,
         description = EXCLUDED.description,
         lead_note = EXCLUDED.lead_note,
         updated_at = NOW()`,
      [
        section.slug,
        section.name,
        section.shortName,
        section.description,
        section.leadNote,
      ]
    );
    return section;
  }

  async queryAllArticlesFromDb(): Promise<Article[]> {
    const res = await this.pool.query(
      `SELECT slug, title, subtitle, excerpt, section_slug, author_slug, reviewer_slug,
              published_at, updated_at, last_reviewed_at, reading_time_minutes,
              is_breaking, is_featured_lead, is_secondary_lead, is_opinion,
              most_read_rank, location_dateline, pull_quote, key_takeaways,
              body, figure, primary_sources, tags, related_article_slugs, related_pseo_slugs
       FROM articles
       ORDER BY published_at DESC`
    );
    const articles = res.rows.map(mapRowToArticle);
    if (articles.length > 0) {
      this.state.articles = articles;
    }
    return articles;
  }

  async queryArticleBySlugFromDb(slug: string): Promise<Article | undefined> {
    const res = await this.pool.query(
      `SELECT slug, title, subtitle, excerpt, section_slug, author_slug, reviewer_slug,
              published_at, updated_at, last_reviewed_at, reading_time_minutes,
              is_breaking, is_featured_lead, is_secondary_lead, is_opinion,
              most_read_rank, location_dateline, pull_quote, key_takeaways,
              body, figure, primary_sources, tags, related_article_slugs, related_pseo_slugs
       FROM articles
       WHERE slug = $1
       LIMIT 1`,
      [slug]
    );
    return res.rows[0] ? mapRowToArticle(res.rows[0]) : undefined;
  }

  async upsertArticleInDb(article: Article): Promise<Article> {
    if (article.isFeaturedLead) {
      await this.pool.query(
        'UPDATE articles SET is_featured_lead = FALSE WHERE slug <> $1 AND is_featured_lead = TRUE',
        [article.slug]
      );
    }

    await this.pool.query(
      `INSERT INTO articles (
         slug, title, subtitle, excerpt, section_slug, author_slug, reviewer_slug,
         published_at, updated_at, last_reviewed_at, reading_time_minutes,
         is_breaking, is_featured_lead, is_secondary_lead, is_opinion,
         most_read_rank, location_dateline, pull_quote, key_takeaways,
         body, figure, primary_sources, tags, related_article_slugs, related_pseo_slugs
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11,
         $12, $13, $14, $15,
         $16, $17, $18::jsonb, $19::jsonb,
         $20::jsonb, $21::jsonb, $22::jsonb, $23::jsonb, $24::jsonb, $25::jsonb
       )
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         excerpt = EXCLUDED.excerpt,
         section_slug = EXCLUDED.section_slug,
         author_slug = EXCLUDED.author_slug,
         reviewer_slug = EXCLUDED.reviewer_slug,
         published_at = EXCLUDED.published_at,
         updated_at = EXCLUDED.updated_at,
         last_reviewed_at = EXCLUDED.last_reviewed_at,
         reading_time_minutes = EXCLUDED.reading_time_minutes,
         is_breaking = EXCLUDED.is_breaking,
         is_featured_lead = EXCLUDED.is_featured_lead,
         is_secondary_lead = EXCLUDED.is_secondary_lead,
         is_opinion = EXCLUDED.is_opinion,
         most_read_rank = EXCLUDED.most_read_rank,
         location_dateline = EXCLUDED.location_dateline,
         pull_quote = EXCLUDED.pull_quote,
         key_takeaways = EXCLUDED.key_takeaways,
         body = EXCLUDED.body,
         figure = EXCLUDED.figure,
         primary_sources = EXCLUDED.primary_sources,
         tags = EXCLUDED.tags,
         related_article_slugs = EXCLUDED.related_article_slugs,
         related_pseo_slugs = EXCLUDED.related_pseo_slugs`,
      [
        article.slug,
        article.title,
        article.subtitle,
        article.excerpt,
        article.section,
        article.authorSlug,
        article.reviewerSlug,
        article.publishedAt,
        article.updatedAt,
        article.lastReviewedAt,
        article.readingTimeMinutes,
        Boolean(article.isBreaking),
        Boolean(article.isFeaturedLead),
        Boolean(article.isSecondaryLead),
        Boolean(article.isOpinion),
        article.mostReadRank ?? null,
        article.locationDateline,
        JSON.stringify(article.pullQuote),
        JSON.stringify(article.keyTakeaways),
        JSON.stringify(article.body),
        JSON.stringify(article.figure),
        JSON.stringify(article.primarySources),
        JSON.stringify(article.tags),
        JSON.stringify(article.relatedArticleSlugs),
        JSON.stringify(article.relatedPseoSlugs),
      ]
    );
    return article;
  }

  async deleteArticleFromDb(slug: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM articles WHERE slug = $1', [slug]);
    return (res.rowCount ?? 0) > 0;
  }

  async queryAuthorsFromDb(): Promise<AuthorProfile[]> {
    const res = await this.pool.query(
      `SELECT slug, name, credentials, role, institution, bio, education,
              clinical_specialties, peer_reviewed_publications,
              conflict_of_interest_disclosure, is_medical_reviewer, orcid
       FROM authors
       ORDER BY slug ASC`
    );
    const authors = res.rows.map(mapRowToAuthor);
    if (authors.length > 0) {
      this.state.authors = authors;
    }
    return authors;
  }

  async upsertAuthorInDb(author: AuthorProfile): Promise<AuthorProfile> {
    await this.pool.query(
      `INSERT INTO authors (
         slug, name, credentials, role, institution, bio,
         education, clinical_specialties, peer_reviewed_publications,
         conflict_of_interest_disclosure, is_medical_reviewer, orcid, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7::jsonb, $8::jsonb, $9,
         $10, $11, $12, NOW()
       )
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         credentials = EXCLUDED.credentials,
         role = EXCLUDED.role,
         institution = EXCLUDED.institution,
         bio = EXCLUDED.bio,
         education = EXCLUDED.education,
         clinical_specialties = EXCLUDED.clinical_specialties,
         peer_reviewed_publications = EXCLUDED.peer_reviewed_publications,
         conflict_of_interest_disclosure = EXCLUDED.conflict_of_interest_disclosure,
         is_medical_reviewer = EXCLUDED.is_medical_reviewer,
         orcid = EXCLUDED.orcid,
         updated_at = NOW()`,
      [
        author.slug,
        author.name,
        author.credentials,
        author.role,
        author.institution,
        author.bio,
        JSON.stringify(author.education),
        JSON.stringify(author.clinicalSpecialties),
        author.peerReviewedPublications,
        author.conflictOfInterestDisclosure,
        author.isMedicalReviewer,
        author.orcid,
      ]
    );
    return author;
  }

  async deleteAuthorFromDb(slug: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM authors WHERE slug = $1', [slug]);
    return (res.rowCount ?? 0) > 0;
  }

  async queryCorePseoPagesFromDb(category?: PseoCategory): Promise<PseoPage[]> {
    const res = category
      ? await this.pool.query(
          `SELECT slug, category, url_path, title, subtitle, meta_title, meta_description,
                  canonical_url, dsm_or_icd_code, evidence_grade, last_reviewed_at, updated_at,
                  reviewer_slug, author_slug, clinical_summary, neurobiological_mechanism,
                  diagnostic_or_clinical_criteria, epidemiology_and_metrics,
                  treatment_or_clinical_protocols, faqs, primary_sources,
                  related_pseo_paths, related_article_slugs
           FROM pseo_pages
           WHERE category = $1
           ORDER BY slug ASC`,
          [category]
        )
      : await this.pool.query(
          `SELECT slug, category, url_path, title, subtitle, meta_title, meta_description,
                  canonical_url, dsm_or_icd_code, evidence_grade, last_reviewed_at, updated_at,
                  reviewer_slug, author_slug, clinical_summary, neurobiological_mechanism,
                  diagnostic_or_clinical_criteria, epidemiology_and_metrics,
                  treatment_or_clinical_protocols, faqs, primary_sources,
                  related_pseo_paths, related_article_slugs
           FROM pseo_pages
           ORDER BY slug ASC`
        );
    return res.rows.map(mapRowToPseoPage);
  }

  async upsertCorePseoPageInDb(page: PseoPage): Promise<PseoPage> {
    await this.pool.query(
      `INSERT INTO pseo_pages (
         slug, category, url_path, title, subtitle, meta_title, meta_description,
         canonical_url, dsm_or_icd_code, evidence_grade, last_reviewed_at, updated_at,
         reviewer_slug, author_slug, clinical_summary, neurobiological_mechanism,
         diagnostic_or_clinical_criteria, epidemiology_and_metrics,
         treatment_or_clinical_protocols, faqs, primary_sources,
         related_pseo_paths, related_article_slugs
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12,
         $13, $14, $15, $16,
         $17::jsonb, $18::jsonb,
         $19::jsonb, $20::jsonb, $21::jsonb,
         $22::jsonb, $23::jsonb
       )
       ON CONFLICT (slug) DO UPDATE SET
         category = EXCLUDED.category,
         url_path = EXCLUDED.url_path,
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         meta_title = EXCLUDED.meta_title,
         meta_description = EXCLUDED.meta_description,
         canonical_url = EXCLUDED.canonical_url,
         dsm_or_icd_code = EXCLUDED.dsm_or_icd_code,
         evidence_grade = EXCLUDED.evidence_grade,
         last_reviewed_at = EXCLUDED.last_reviewed_at,
         updated_at = EXCLUDED.updated_at,
         reviewer_slug = EXCLUDED.reviewer_slug,
         author_slug = EXCLUDED.author_slug,
         clinical_summary = EXCLUDED.clinical_summary,
         neurobiological_mechanism = EXCLUDED.neurobiological_mechanism,
         diagnostic_or_clinical_criteria = EXCLUDED.diagnostic_or_clinical_criteria,
         epidemiology_and_metrics = EXCLUDED.epidemiology_and_metrics,
         treatment_or_clinical_protocols = EXCLUDED.treatment_or_clinical_protocols,
         faqs = EXCLUDED.faqs,
         primary_sources = EXCLUDED.primary_sources,
         related_pseo_paths = EXCLUDED.related_pseo_paths,
         related_article_slugs = EXCLUDED.related_article_slugs`,
      [
        page.slug,
        page.category,
        page.urlPath,
        page.title,
        page.subtitle,
        page.metaTitle,
        page.metaDescription,
        page.canonicalUrl,
        page.dsmOrIcdCode ?? null,
        page.evidenceGrade ?? null,
        page.lastReviewedAt,
        page.updatedAt,
        page.reviewerSlug,
        page.authorSlug,
        page.clinicalSummary,
        page.neurobiologicalMechanism,
        JSON.stringify(page.diagnosticOrClinicalCriteria),
        JSON.stringify(page.epidemiologyAndMetrics),
        JSON.stringify(page.treatmentOrClinicalProtocols),
        JSON.stringify(page.faqs),
        JSON.stringify(page.primarySources),
        JSON.stringify(page.relatedPseoPaths),
        JSON.stringify(page.relatedArticleSlugs),
      ]
    );
    return page;
  }

  async findAdminUserByUsernameInDb(username: string): Promise<AdminUser | null> {
    const res = await this.pool.query(
      `SELECT id, username, display_name, role, password_hash, totp_enabled, last_login_at
       FROM admin_users
       WHERE LOWER(username) = LOWER($1)
       LIMIT 1`,
      [username.trim()]
    );
    return res.rows[0] ? mapRowToAdminUser(res.rows[0]) : null;
  }

  async upsertAdminUserInDb(user: AdminUser): Promise<AdminUser> {
    await this.pool.query(
      `INSERT INTO admin_users (
         id, username, display_name, role, password_hash, totp_enabled, last_login_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (username) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         role = EXCLUDED.role,
         password_hash = EXCLUDED.password_hash,
         totp_enabled = EXCLUDED.totp_enabled,
         last_login_at = COALESCE(EXCLUDED.last_login_at, admin_users.last_login_at),
         updated_at = NOW()`,
      [
        user.id,
        user.username,
        user.displayName,
        user.role,
        user.passwordHash,
        user.totpEnabled,
        user.lastLoginAt ?? null,
      ]
    );
    return user;
  }

  async insertAuditLogInDb(entry: AuditLogEntry): Promise<void> {
    await this.pool.query(
      `INSERT INTO audit_logs (
         id, timestamp, actor_username, actor_role, action, resource, ip_address, status, details
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        entry.id,
        entry.timestamp,
        entry.actorUsername,
        entry.actorRole,
        entry.action,
        entry.resource,
        entry.ipAddress,
        entry.status,
        entry.details,
      ]
    );
  }

  async searchPublicationInDb(
    query: string,
    limit: number = 10
  ): Promise<{ articles: Article[]; pseoPages: PseoPage[] }> {
    const q = query.trim();
    if (!q) {
      return {
        articles: this.getAllArticles().slice(0, 5),
        pseoPages: this.state.corePseoPages.slice(0, 5),
      };
    }

    const pattern = `%${q}%`;
    const [artRes, pseoRes] = await Promise.all([
      this.pool.query(
        `SELECT slug, title, subtitle, excerpt, section_slug, author_slug, reviewer_slug,
                published_at, updated_at, last_reviewed_at, reading_time_minutes,
                is_breaking, is_featured_lead, is_secondary_lead, is_opinion,
                most_read_rank, location_dateline, pull_quote, key_takeaways,
                body, figure, primary_sources, tags, related_article_slugs, related_pseo_slugs
         FROM articles
         WHERE title ILIKE $1 OR subtitle ILIKE $1 OR tags::text ILIKE $1
         ORDER BY published_at DESC
         LIMIT $2`,
        [pattern, limit]
      ),
      this.pool.query(
        `SELECT slug, category, url_path, title, subtitle, meta_title, meta_description,
                canonical_url, dsm_or_icd_code, evidence_grade, last_reviewed_at, updated_at,
                reviewer_slug, author_slug, clinical_summary, neurobiological_mechanism,
                diagnostic_or_clinical_criteria, epidemiology_and_metrics,
                treatment_or_clinical_protocols, faqs, primary_sources,
                related_pseo_paths, related_article_slugs
         FROM pseo_pages
         WHERE title ILIKE $1 OR subtitle ILIKE $1 OR clinical_summary ILIKE $1
         ORDER BY slug ASC
         LIMIT $2`,
        [pattern, limit]
      ),
    ]);

    return {
      articles: artRes.rows.map(mapRowToArticle),
      pseoPages: pseoRes.rows.map(mapRowToPseoPage),
    };
  }

  // =========================================================================
  // SYNCHRONOUS IPublicationRepository INTERFACE (WRITE-THROUGH TO POSTGRES)
  // =========================================================================

  getSections(): SectionInfo[] {
    return [...this.state.sections];
  }

  getSectionBySlug(slug: string): SectionInfo | undefined {
    return this.state.sections.find((s) => s.slug === slug);
  }

  saveSection(section: SectionInfo): SectionInfo {
    const idx = this.state.sections.findIndex((s) => s.slug === section.slug);
    if (idx >= 0) {
      this.state.sections[idx] = section;
    } else {
      this.state.sections.push(section);
    }
    this.runBackgroundQuery(this.upsertSectionInDb(section), 'saveSection');
    return section;
  }

  getAllArticles(): Article[] {
    return [...this.state.articles].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  getArticleBySlug(slug: string): Article | undefined {
    const found = this.state.articles.find((a) => a.slug === slug);
    if (!found) return undefined;
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
    const filtered = this.state.articles.filter((a) => a.section === sectionSlug);
    return filtered.length > 0 ? filtered : this.getAllArticles().slice(0, 4);
  }

  getLeadArticle(): Article {
    return this.state.articles.find((a) => a.isFeaturedLead) || this.state.articles[0];
  }

  getSecondaryArticles(): Article[] {
    return this.state.articles.filter((a) => a.isSecondaryLead && !a.isFeaturedLead);
  }

  getBreakingArticles(): Article[] {
    return this.getAllArticles();
  }

  getOpinionArticles(): Article[] {
    return this.state.articles.filter((a) => a.section === 'opinion' || a.isOpinion);
  }

  getMostReadArticles(): Article[] {
    return [...this.state.articles]
      .filter((a) => typeof a.mostReadRank === 'number')
      .sort((a, b) => (a.mostReadRank || 99) - (b.mostReadRank || 99));
  }

  createOrUpdateArticle(article: Article): Article {
    if (article.isFeaturedLead) {
      this.state.articles = this.state.articles.map((a) =>
        a.slug === article.slug ? a : { ...a, isFeaturedLead: false }
      );
    }
    const idx = this.state.articles.findIndex((a) => a.slug === article.slug);
    if (idx >= 0) {
      this.state.articles[idx] = article;
    } else {
      this.state.articles.unshift(article);
    }
    this.runBackgroundQuery(this.upsertArticleInDb(article), 'createOrUpdateArticle');
    return article;
  }

  deleteArticle(slug: string): boolean {
    if (this.state.articles.length <= 1) return false;
    const before = this.state.articles.length;
    this.state.articles = this.state.articles.filter((a) => a.slug !== slug);
    const deleted = this.state.articles.length < before;
    if (deleted) {
      this.runBackgroundQuery(this.deleteArticleFromDb(slug), 'deleteArticle');
    }
    return deleted;
  }

  getAllTags(): { tag: string; slug: string; count: number }[] {
    const map = new Map<string, { tag: string; slug: string; count: number }>();
    for (const art of this.state.articles) {
      for (const rawTag of art.tags) {
        const s = slugifyTagInternal(rawTag);
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
    const matched = this.state.articles.filter((art) =>
      art.tags.some((t) => {
        const s = slugifyTagInternal(t);
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
    return [...this.state.authors];
  }

  getAuthorBySlug(slug: string): AuthorProfile | undefined {
    return this.state.authors.find((a) => a.slug === slug) || this.state.authors[0];
  }

  saveAuthor(author: AuthorProfile): AuthorProfile {
    const idx = this.state.authors.findIndex((a) => a.slug === author.slug);
    if (idx >= 0) {
      this.state.authors[idx] = author;
    } else {
      this.state.authors.push(author);
    }
    this.runBackgroundQuery(this.upsertAuthorInDb(author), 'saveAuthor');
    return author;
  }

  deleteAuthor(slug: string): boolean {
    if (this.state.authors.length <= 1) return false;
    const before = this.state.authors.length;
    this.state.authors = this.state.authors.filter((a) => a.slug !== slug);
    const deleted = this.state.authors.length < before;
    if (deleted) {
      this.runBackgroundQuery(this.deleteAuthorFromDb(slug), 'deleteAuthor');
    }
    return deleted;
  }

  getCorePseoPages(category?: PseoCategory): PseoPage[] {
    if (!category) return [...this.state.corePseoPages];
    return this.state.corePseoPages.filter((p) => p.category === category);
  }

  getPseoPage(categoryRoute: string, slug: string): PseoPage | null {
    const customMatch = this.state.corePseoPages.find((p) => p.slug === slug);
    if (customMatch) return customMatch;
    return resolveDynamicPseoPage(categoryRoute, slug);
  }

  saveCorePseoPage(page: PseoPage): PseoPage {
    const idx = this.state.corePseoPages.findIndex((p) => p.slug === page.slug);
    if (idx >= 0) {
      this.state.corePseoPages[idx] = page;
    } else {
      this.state.corePseoPages.unshift(page);
    }
    this.runBackgroundQuery(this.upsertCorePseoPageInDb(page), 'saveCorePseoPage');
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
        pseoPages: this.state.corePseoPages.slice(0, 5),
      };
    }
    const articles = this.state.articles
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, limit);
    const pseoPages = this.state.corePseoPages
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.clinicalSummary.toLowerCase().includes(q)
      )
      .slice(0, limit);
    return { articles, pseoPages };
  }

  exportStateSnapshot(): CmsPersistentState {
    return {
      articles: [...this.state.articles],
      authors: [...this.state.authors],
      sections: [...this.state.sections],
      corePseoPages: [...this.state.corePseoPages],
    };
  }

  importStateSnapshot(snapshot: Partial<CmsPersistentState>): CmsPersistentState {
    const validation = validateAndSanitizeCmsSnapshot(snapshot);
    if (!validation.valid || !validation.sanitized) {
      throw new Error(validation.error || 'Invalid CMS snapshot.');
    }
    const clean = validation.sanitized;

    if (clean.sections && clean.sections.length > 0) {
      this.state.sections = clean.sections;
      for (const s of clean.sections) {
        this.runBackgroundQuery(this.upsertSectionInDb(s), 'importStateSnapshot:section');
      }
    }
    if (clean.authors && clean.authors.length > 0) {
      this.state.authors = clean.authors;
      for (const a of clean.authors) {
        this.runBackgroundQuery(this.upsertAuthorInDb(a), 'importStateSnapshot:author');
      }
    }
    if (clean.articles && clean.articles.length > 0) {
      this.state.articles = clean.articles;
      for (const art of clean.articles) {
        this.runBackgroundQuery(this.upsertArticleInDb(art), 'importStateSnapshot:article');
      }
    }
    if (clean.corePseoPages && clean.corePseoPages.length > 0) {
      this.state.corePseoPages = clean.corePseoPages;
      for (const p of clean.corePseoPages) {
        this.runBackgroundQuery(
          this.upsertCorePseoPageInDb(p),
          'importStateSnapshot:pseoPage'
        );
      }
    }

    return this.exportStateSnapshot();
  }
}
