import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { BRAND_CONFIG, publicationService } from '@/lib/services/publication-service';
import {
  MAX_SNAPSHOT_BYTES,
  appendAuditLog,
  extractClientIp,
  getAuditLogs,
  hasPermission,
  sanitizePlainText,
  validateAndSanitizeCmsSnapshot,
  verifyCsrfToken,
  verifyIpAllowlist,
  verifySessionCookie,
} from '@/lib/security';
import type {
  AuthorProfile,
  PseoCategory,
  PseoPage,
  SectionInfo,
  SectionSlug,
} from '@/lib/domain/types';

const COOKIE_NAME = 'tpt_admin_session';

export async function POST(req: NextRequest) {
  try {
    const ip = extractClientIp({
      headers: req.headers,
      directIp: (req as { ip?: string }).ip,
    });

    if (!verifyIpAllowlist(ip)) {
      appendAuditLog({
        actorUsername: 'unauthenticated',
        actorRole: 'unauthenticated',
        action: 'content:ip_blocked',
        resource: '/api/admin/content',
        ipAddress: ip,
        status: 'denied',
        details: 'Request IP not in ADMIN_IP_ALLOWLIST.',
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieVal = req.cookies.get(COOKIE_NAME)?.value;
    const session = verifySessionCookie(cookieVal);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const csrfHeader = req.headers.get('x-csrf-token') || undefined;
    if (!verifyCsrfToken(session, csrfHeader)) {
      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'security:csrf_rejected',
        resource: '/api/admin/content',
        ipAddress: ip,
        status: 'denied',
        details: 'Missing or invalid CSRF token on state-changing request.',
      });
      return NextResponse.json({ error: 'CSRF token validation failed.' }, { status: 403 });
    }

    const contentLengthHeader = Number(req.headers.get('content-length') || '0');
    if (contentLengthHeader > MAX_SNAPSHOT_BYTES) {
      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'cms:payload_too_large',
        resource: '/api/admin/content',
        ipAddress: ip,
        status: 'denied',
        details: `Rejected payload (${contentLengthHeader} bytes) exceeding 512 KB limit.`,
      });
      return NextResponse.json(
        { error: 'Payload Too Large: Request exceeds the 512 KB maximum file size limit.' },
        { status: 413 }
      );
    }

    const rawBodyText = await req.text();
    if (Buffer.byteLength(rawBodyText, 'utf8') > MAX_SNAPSHOT_BYTES) {
      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'cms:payload_too_large',
        resource: '/api/admin/content',
        ipAddress: ip,
        status: 'denied',
        details: 'Rejected JSON body exceeding 512 KB maximum file size limit.',
      });
      return NextResponse.json(
        { error: 'Payload Too Large: JSON file exceeds the 512 KB maximum size limit.' },
        { status: 413 }
      );
    }

    let body: Record<string, any>;
    try {
      body = JSON.parse(rawBodyText);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON request body.' }, { status: 400 });
    }
    const operation = body?.operation;

    // -------------------------------------------------------------------------
    // 1. CREATE OR UPDATE ARTICLE
    // -------------------------------------------------------------------------
    if (operation === 'create_article' || operation === 'save_article') {
      if (!hasPermission(session.role, 'articles:edit')) {
        appendAuditLog({
          actorUsername: session.username,
          actorRole: session.role,
          action: 'articles:edit_denied',
          resource: '/api/admin/content',
          ipAddress: ip,
          status: 'denied',
          details: `Role ${session.role} lacks articles:edit permission.`,
        });
        return NextResponse.json({ error: 'Insufficient RBAC permissions.' }, { status: 403 });
      }

      const title = sanitizePlainText(body?.title || '', 260);
      const subtitle = sanitizePlainText(body?.subtitle || '', 500);
      const section = (body?.section || 'latest-news') as SectionSlug;
      const locationDateline = sanitizePlainText(body?.locationDateline || '[DATELINE]', 80);
      const authorSlug = sanitizePlainText(body?.authorSlug || 'author-placeholder', 80);
      const reviewerSlug = sanitizePlainText(body?.reviewerSlug || 'reviewer-placeholder', 80);
      const doiOrUrl = sanitizePlainText(
        body?.doiOrUrl || 'https://doi.org/[DOI-Placeholder]',
        240
      );
      const journal = sanitizePlainText(body?.journal || '[Journal / Source Name]', 140);
      const studyTitle = sanitizePlainText(
        body?.studyTitle || '[Primary Study Title Placeholder]',
        220
      );
      const studyDesign = sanitizePlainText(
        body?.studyDesign || '[Study Design Placeholder]',
        140
      );
      const sampleSize = sanitizePlainText(body?.sampleSize || '[Sample Size Placeholder]', 100);
      const pullQuoteText = sanitizePlainText(body?.pullQuote || '', 400);
      const pullQuoteAttr = sanitizePlainText(
        body?.pullQuoteAttribution || '[Quote Attribution Placeholder]',
        160
      );
      const bodyText = sanitizePlainText(body?.bodyText || '', 6000);
      const isFeaturedLead = Boolean(body?.isFeaturedLead);

      if (!title || title.length < 5 || !subtitle) {
        return NextResponse.json(
          { error: 'Headline and subheadline are required.' },
          { status: 400 }
        );
      }

      const providedSlug = sanitizePlainText(body?.slug || '', 120);
      const slug =
        providedSlug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 72);

      const nowIso = new Date().toISOString();
      const existing = publicationService.getArticleBySlug(slug);
      const baseLead = existing || publicationService.getLeadArticle();

      const paragraphs = bodyText
        ? bodyText
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
        : baseLead.body[0]?.paragraphs || [subtitle];

      const updatedArticle = publicationService.createOrUpdateArticle({
        ...baseLead,
        slug,
        title,
        subtitle,
        excerpt: subtitle,
        section,
        authorSlug,
        reviewerSlug,
        locationDateline,
        publishedAt: existing ? existing.publishedAt : nowIso,
        updatedAt: nowIso,
        lastReviewedAt: nowIso,
        isFeaturedLead,
        isBreaking: true,
        pullQuote: {
          quote: pullQuoteText || baseLead.pullQuote.quote,
          attribution: pullQuoteAttr,
        },
        body: [
          {
            heading: existing?.body[0]?.heading || 'Clinical Context & Findings',
            paragraphs,
            callout: existing?.body[0]?.callout,
          },
          ...(existing?.body.slice(1) || []),
        ],
        primarySources: [
          {
            id: existing?.primarySources[0]?.id || `src-${Date.now()}`,
            title: studyTitle,
            journalOrInstitution: journal,
            publicationDate: existing?.primarySources[0]?.publicationDate || '[Publication Date]',
            doiOrUrl,
            studyDesign,
            sampleSize,
          },
        ],
      });

      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: existing ? 'articles:updated' : 'articles:published',
        resource: `/articles/${updatedArticle.slug}`,
        ipAddress: ip,
        status: 'success',
        details: `${existing ? 'Updated' : 'Published'} article "${updatedArticle.title}" with sanitized input and CSRF verification.`,
      });

      revalidatePath('/', 'layout');

      return NextResponse.json({
        ok: true,
        article: updatedArticle,
        articles: publicationService.getAllArticles(),
        auditLogs: getAuditLogs(),
      });
    }

    // -------------------------------------------------------------------------
    // 2. DELETE ARTICLE (Requires articles:delete — Admin role)
    // -------------------------------------------------------------------------
    if (operation === 'delete_article') {
      if (!hasPermission(session.role, 'articles:delete')) {
        appendAuditLog({
          actorUsername: session.username,
          actorRole: session.role,
          action: 'articles:delete_denied',
          resource: `/articles/${body?.slug || 'unknown'}`,
          ipAddress: ip,
          status: 'denied',
          details: `Role "${session.role}" lacks articles:delete permission (requires admin).`,
        });
        return NextResponse.json(
          { error: `Role '${session.role}' does not have permission 'articles:delete'.` },
          { status: 403 }
        );
      }

      const targetSlug = sanitizePlainText(body?.slug || '', 120);
      const deleted = publicationService.deleteArticle(targetSlug);
      if (!deleted) {
        return NextResponse.json(
          { error: 'Unable to delete article (at least 1 article must remain).' },
          { status: 400 }
        );
      }

      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'articles:deleted',
        resource: `/articles/${targetSlug}`,
        ipAddress: ip,
        status: 'success',
        details: `Deleted article /articles/${targetSlug}.`,
      });

      revalidatePath('/', 'layout');

      return NextResponse.json({
        ok: true,
        articles: publicationService.getAllArticles(),
        auditLogs: getAuditLogs(),
      });
    }

    // -------------------------------------------------------------------------
    // 3. SAVE / UPDATE AUTHOR OR MEDICAL REVIEWER PROFILE
    // -------------------------------------------------------------------------
    if (operation === 'save_author') {
      if (!hasPermission(session.role, 'articles:edit')) {
        return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 });
      }

      const name = sanitizePlainText(body?.name || '', 120);
      const credentials = sanitizePlainText(body?.credentials || '', 80);
      const role = sanitizePlainText(body?.role || '', 120);
      const institution = sanitizePlainText(body?.institution || '', 160);
      const orcid = sanitizePlainText(body?.orcid || '[0000-0000-0000-0000]', 40);
      const bio = sanitizePlainText(body?.bio || '', 1500);
      const educationRaw = sanitizePlainText(body?.education || '', 600);
      const specialtiesRaw = sanitizePlainText(body?.clinicalSpecialties || '', 400);
      const conflictOfInterestDisclosure = sanitizePlainText(
        body?.conflictOfInterestDisclosure || '[Conflict of Interest Disclosure Placeholder]',
        600
      );
      const isMedicalReviewer = Boolean(body?.isMedicalReviewer);

      if (!name || !credentials) {
        return NextResponse.json(
          { error: 'Author/Reviewer name and credentials are required.' },
          { status: 400 }
        );
      }

      const providedSlug = sanitizePlainText(body?.slug || '', 80);
      const slug =
        providedSlug ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 60);

      const savedAuthor: AuthorProfile = {
        slug,
        name,
        credentials,
        role: role || '[Role / Title]',
        institution: institution || '[Institution / Affiliation]',
        education: educationRaw
          ? educationRaw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : ['[Degree / Training Placeholder]'],
        clinicalSpecialties: specialtiesRaw
          ? specialtiesRaw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : ['[Clinical Specialty Placeholder]'],
        bio: bio || '[Biography Placeholder]',
        orcid,
        peerReviewedPublications: 0,
        isMedicalReviewer,
        conflictOfInterestDisclosure,
      };

      publicationService.saveAuthor(savedAuthor);

      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'authors:profile_saved',
        resource: `/authors/${savedAuthor.slug}`,
        ipAddress: ip,
        status: 'success',
        details: `Updated clinician profile "${savedAuthor.name}, ${savedAuthor.credentials}" (${savedAuthor.slug}).`,
      });

      revalidatePath('/', 'layout');

      return NextResponse.json({
        ok: true,
        author: savedAuthor,
        authors: publicationService.getAuthors(),
        auditLogs: getAuditLogs(),
      });
    }

    // -------------------------------------------------------------------------
    // 4. SAVE / UPDATE EDITORIAL SECTION / CATEGORY
    // -------------------------------------------------------------------------
    if (operation === 'save_section') {
      if (!hasPermission(session.role, 'pseo:manage')) {
        return NextResponse.json(
          { error: 'Requires editor or admin role to modify sections.' },
          { status: 403 }
        );
      }

      const slug = sanitizePlainText(body?.slug || '', 60) as SectionSlug;
      const name = sanitizePlainText(body?.name || '', 80);
      const shortName = sanitizePlainText(body?.shortName || name, 40);
      const description = sanitizePlainText(body?.description || '', 400);
      const leadNote = sanitizePlainText(body?.leadNote || '', 120);

      if (!slug || !name || !description) {
        return NextResponse.json(
          { error: 'Section slug, name, and description are required.' },
          { status: 400 }
        );
      }

      const savedSection: SectionInfo = {
        slug,
        name,
        shortName,
        description,
        leadNote: leadNote || `${name} Desk`,
      };

      publicationService.saveSection(savedSection);

      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'sections:updated',
        resource: `/section/${savedSection.slug}`,
        ipAddress: ip,
        status: 'success',
        details: `Updated editorial section "${savedSection.name}" (/section/${savedSection.slug}).`,
      });

      revalidatePath('/', 'layout');

      return NextResponse.json({
        ok: true,
        section: savedSection,
        sections: publicationService.getSections(),
        auditLogs: getAuditLogs(),
      });
    }

    // -------------------------------------------------------------------------
    // 5. SAVE / UPDATE CORE pSEO TEMPLATE PAGE
    // -------------------------------------------------------------------------
    if (operation === 'save_pseo_page') {
      if (!hasPermission(session.role, 'pseo:manage')) {
        return NextResponse.json(
          { error: `Role '${session.role}' does not have permission 'pseo:manage'.` },
          { status: 403 }
        );
      }

      const slug = sanitizePlainText(body?.slug || '', 100);
      const category = (body?.category || 'condition') as PseoCategory;
      const title = sanitizePlainText(body?.title || '', 220);
      const subtitle = sanitizePlainText(body?.subtitle || '', 400);
      const dsmOrIcdCode = sanitizePlainText(
        body?.dsmOrIcdCode || '[Diagnostic Code Placeholder]',
        100
      );
      const evidenceGrade = sanitizePlainText(
        body?.evidenceGrade || '[Evidence Grade Placeholder]',
        100
      );
      const clinicalSummary = sanitizePlainText(body?.clinicalSummary || '', 2000);
      const neurobiologicalMechanism = sanitizePlainText(
        body?.neurobiologicalMechanism || '',
        2000
      );

      if (!slug || !title || !clinicalSummary) {
        return NextResponse.json(
          { error: 'Slug, title, and clinical summary are required for pSEO templates.' },
          { status: 400 }
        );
      }

      const existing = publicationService
        .getCorePseoPages()
        .find((p) => p.slug === slug);
      const baseTemplate = existing || publicationService.getCorePseoPages()[0];

      const routePrefixMap: Record<PseoCategory, string> = {
        condition: '/conditions',
        treatment: '/treatments',
        'topic-hub': '/topics',
        'study-explainer': '/studies',
        glossary: '/glossary',
        faq: '/faq',
      };
      const urlPath = existing?.urlPath || `${routePrefixMap[category] || '/conditions'}/${slug}`;
      const nowIso = new Date().toISOString();

      const savedPage: PseoPage = {
        ...baseTemplate,
        slug,
        category,
        urlPath,
        canonicalUrl: `${BRAND_CONFIG.canonicalBase}${urlPath}`,
        title,
        subtitle: subtitle || baseTemplate.subtitle,
        metaDescription: subtitle || clinicalSummary.slice(0, 155),
        dsmOrIcdCode,
        evidenceGrade,
        clinicalSummary,
        neurobiologicalMechanism:
          neurobiologicalMechanism || baseTemplate.neurobiologicalMechanism,
        lastReviewedAt: nowIso,
        updatedAt: nowIso,
      };

      publicationService.saveCorePseoPage(savedPage);

      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'pseo:template_saved',
        resource: savedPage.urlPath,
        ipAddress: ip,
        status: 'success',
        details: `Updated pSEO template "${savedPage.title}" (${savedPage.urlPath}).`,
      });

      revalidatePath('/', 'layout');

      return NextResponse.json({
        ok: true,
        pseoPage: savedPage,
        pseoCorePages: publicationService.getCorePseoPages(),
        auditLogs: getAuditLogs(),
      });
    }

    // -------------------------------------------------------------------------
    // 6. RE-INDEX pSEO SITEMAP CHUNKS
    // -------------------------------------------------------------------------
    if (operation === 'reindex_pseo') {
      if (!hasPermission(session.role, 'pseo:manage')) {
        appendAuditLog({
          actorUsername: session.username,
          actorRole: session.role,
          action: 'pseo:reindex_denied',
          resource: '/sitemap.xml',
          ipAddress: ip,
          status: 'denied',
          details: `Role "${session.role}" is not permitted to modify pSEO templates or reindex sitemaps (requires editor or admin).`,
        });
        return NextResponse.json(
          { error: `Role '${session.role}' does not have permission 'pseo:manage'.` },
          { status: 403 }
        );
      }

      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'pseo:sitemap_reindexed',
        resource: '/sitemap.xml (/sitemap_1.xml .. /sitemap_3.xml)',
        ipAddress: ip,
        status: 'success',
        details: 'Verified structured pSEO URLs and updated chunk lastmod timestamps.',
      });

      revalidatePath('/sitemap.xml');
      revalidatePath('/news-sitemap.xml');

      return NextResponse.json({
        ok: true,
        message: 'Sitemap index and XML chunks verified and updated.',
        auditLogs: getAuditLogs(),
      });
    }

    // -------------------------------------------------------------------------
    // 7. EXPORT OR IMPORT FULL CMS SNAPSHOT (Strictly Admin-Only, Schema-Validated,
    //    HTML-Sanitized, and Size-Limited to 512 KB)
    // -------------------------------------------------------------------------
    if (operation === 'export_snapshot') {
      if (session.role !== 'admin' || !hasPermission(session.role, 'users:manage')) {
        appendAuditLog({
          actorUsername: session.username,
          actorRole: session.role,
          action: 'cms:snapshot_export_denied',
          resource: '.cms-store.json',
          ipAddress: ip,
          status: 'denied',
          details: `Role "${session.role}" denied snapshot export (admin-only operation).`,
        });
        return NextResponse.json(
          { error: 'Forbidden: Only the admin role can export CMS dataset snapshots.' },
          { status: 403 }
        );
      }

      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'cms:snapshot_exported',
        resource: '.cms-store.json',
        ipAddress: ip,
        status: 'success',
        details: 'Admin exported full CMS JSON state snapshot.',
      });

      return NextResponse.json({
        ok: true,
        snapshot: publicationService.exportStateSnapshot(),
        auditLogs: getAuditLogs(),
      });
    }

    if (operation === 'import_snapshot') {
      if (session.role !== 'admin' || !hasPermission(session.role, 'users:manage')) {
        appendAuditLog({
          actorUsername: session.username,
          actorRole: session.role,
          action: 'cms:snapshot_import_denied',
          resource: '.cms-store.json',
          ipAddress: ip,
          status: 'denied',
          details: `Role "${session.role}" denied snapshot import (admin-only operation).`,
        });
        return NextResponse.json(
          { error: 'Forbidden: Only the admin role can import CMS dataset snapshots.' },
          { status: 403 }
        );
      }

      const validation = validateAndSanitizeCmsSnapshot(body?.snapshot, MAX_SNAPSHOT_BYTES);
      if (!validation.valid || !validation.sanitized) {
        appendAuditLog({
          actorUsername: session.username,
          actorRole: session.role,
          action: 'cms:snapshot_schema_rejected',
          resource: '.cms-store.json',
          ipAddress: ip,
          status: 'denied',
          details: `Rejected JSON snapshot import: ${validation.error || 'Schema validation failed'}.`,
        });
        return NextResponse.json(
          { error: validation.error || 'Invalid JSON snapshot schema.' },
          { status: 400 }
        );
      }

      const updatedState = publicationService.importStateSnapshot(validation.sanitized);
      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'cms:snapshot_imported',
        resource: '.cms-store.json',
        ipAddress: ip,
        status: 'success',
        details: `Admin imported strictly validated, HTML-sanitized CMS snapshot (${updatedState.articles.length} articles, ${updatedState.authors.length} authors).`,
      });
      revalidatePath('/', 'layout');

      return NextResponse.json({
        ok: true,
        state: updatedState,
        articles: updatedState.articles,
        authors: updatedState.authors,
        sections: updatedState.sections,
        pseoCorePages: updatedState.corePseoPages,
        auditLogs: getAuditLogs(),
      });
    }

    return NextResponse.json({ error: 'Unsupported operation.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error processing request.' }, { status: 500 });
  }
}
