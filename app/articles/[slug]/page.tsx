import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';
import { ClinicalFigure } from '@/components/editorial/ClinicalFigure';
import { MedicalDisclaimerStrip } from '@/components/editorial/MedicalDisclaimerStrip';
import { NewsletterBlock } from '@/components/editorial/NewsletterBlock';
import { BRAND_CONFIG, publicationService } from '@/lib/services/publication-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = publicationService.getArticleBySlug(slug);
  if (!article) {
    return {
      title: 'Article Not Found | Therapist Psychologist Today',
    };
  }
  const canonicalUrl = `${BRAND_CONFIG.canonicalBase}/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      siteName: BRAND_CONFIG.siteName,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const article = publicationService.getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const author = publicationService.getAuthorBySlug(article.authorSlug);
  const reviewer = publicationService.getAuthorBySlug(article.reviewerSlug);
  const sectionInfo = publicationService.getSectionBySlug(article.section);
  const canonicalUrl = `${BRAND_CONFIG.canonicalBase}/articles/${article.slug}`;

  const relatedArticles = article.relatedArticleSlugs
    .map((s) => publicationService.getArticleBySlug(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const relatedPseoPages = article.relatedPseoSlugs
    .map((s) => publicationService.getPseoPage('conditions', s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const publishedDateFormatted = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const updatedDateFormatted = new Date(article.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const reviewedDateFormatted = new Date(article.lastReviewedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': ['NewsArticle', 'MedicalWebPage'],
      headline: article.title,
      description: article.subtitle,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      lastReviewed: article.lastReviewedAt,
      mainEntityOfPage: canonicalUrl,
      author: author
        ? {
            '@type': 'Person',
            name: `${author.name}, ${author.credentials}`,
            jobTitle: author.role,
            affiliation: author.institution,
            url: `${BRAND_CONFIG.canonicalBase}/authors/${author.slug}`,
          }
        : undefined,
      reviewedBy: reviewer
        ? {
            '@type': 'Person',
            name: `${reviewer.name}, ${reviewer.credentials}`,
            jobTitle: reviewer.role,
            url: `${BRAND_CONFIG.canonicalBase}/authors/${reviewer.slug}`,
          }
        : undefined,
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: BRAND_CONFIG.siteName,
        url: BRAND_CONFIG.canonicalBase,
      },
      citation: article.primarySources.map((src) => ({
        '@type': 'ScholarlyArticle',
        name: src.title,
        publisher: src.journalOrInstitution,
        url: src.doiOrUrl,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: BRAND_CONFIG.canonicalBase,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: sectionInfo?.name || 'Section',
          item: `${BRAND_CONFIG.canonicalBase}/section/${article.section}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: canonicalUrl,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EditorialHeader />

      <main className="flex-1 max-w-[1160px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs font-sans text-neutral-600 mb-4">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#1F44A8] hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/section/${article.section}`}
                className="font-semibold uppercase tracking-wider text-[#1E48B8] hover:underline"
              >
                {sectionInfo?.name || article.section}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-500 truncate max-w-xs sm:max-w-md" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Visible Medical Disclaimer Strip */}
        <MedicalDisclaimerStrip
          lastReviewedAt={article.lastReviewedAt}
          reviewerName={reviewer?.name}
          reviewerCredentials={reviewer?.credentials}
          reviewerSlug={reviewer?.slug}
        />

        {/* Article Header Block */}
        <article className="mt-6">
          <header className="max-w-4xl border-b border-[#E5E5E0] pb-6">
            <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2.5">
              <Link href={`/section/${article.section}`} className="hover:underline">
                {sectionInfo?.name || article.section}
              </Link>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-600 font-normal">
                {article.locationDateline}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#111111] leading-[1.15] tracking-tight text-balance">
              {article.title}
            </h1>

            <p className="mt-4 font-serif text-lg sm:text-xl text-neutral-700 leading-relaxed">
              {article.subtitle}
            </p>

            {/* Byline, Medical Reviewer, Published, Updated, Last Reviewed & Reading Time */}
            <div className="mt-6 pt-4 border-t border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans">
              <div className="space-y-1">
                {author && (
                  <p className="text-[#111111]">
                    By{' '}
                    <Link
                      href={`/authors/${author.slug}`}
                      className="font-bold text-[#1F44A8] underline hover:text-[#111111]"
                    >
                      {author.name}, {author.credentials}
                    </Link>{' '}
                    <span className="text-neutral-600">— {author.role}</span>
                  </p>
                )}
                {reviewer && (
                  <p className="text-neutral-700">
                    Medically reviewed by{' '}
                    <Link
                      href={`/authors/${reviewer.slug}`}
                      className="font-semibold text-[#1F44A8] underline hover:text-[#111111]"
                    >
                      {reviewer.name}, {reviewer.credentials}
                    </Link>{' '}
                    <span className="text-neutral-500">({reviewer.institution})</span>
                  </p>
                )}
              </div>

              <div className="sm:text-right text-neutral-600 space-y-0.5 font-mono text-[11px] shrink-0">
                <div>
                  Published: <time dateTime={article.publishedAt}>{publishedDateFormatted}</time>
                </div>
                <div>
                  Updated: <time dateTime={article.updatedAt}>{updatedDateFormatted}</time>
                </div>
                <div className="text-[#1F44A8] font-semibold">
                  Last reviewed: <time dateTime={article.lastReviewedAt}>{reviewedDateFormatted}</time> ·{' '}
                  {article.readingTimeMinutes} min read
                </div>
              </div>
            </div>
          </header>

          {/* Main Reading Grid: 8 Columns Article Prose + 4 Columns Clinical Sidebar */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              {/* Primary Study Graphic (Eagerly Loaded) */}
              <ClinicalFigure figure={article.figure} priority />

              {/* Key Clinical Takeaways Callout Box in #EEF2FB */}
              <div className="bg-[#EEF2FB] border border-[#1E48B8]/30 p-5 my-6">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2.5">
                  Executive Summary &amp; Clinical Key Takeaways
                </h2>
                <ul className="space-y-2 text-sm font-serif text-[#111111] leading-relaxed list-disc pl-5">
                  {article.keyTakeaways.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Article Body Sections */}
              <div className="space-y-6 font-serif text-base sm:text-[17px] text-[#111111] leading-[1.8] max-w-[68ch]">
                {article.body.map((sectionBlock, bIdx) => (
                  <section key={bIdx} className="space-y-4">
                    {sectionBlock.heading && (
                      <h2 className="font-serif text-2xl font-bold text-[#111111] pt-3 leading-snug">
                        {sectionBlock.heading}
                      </h2>
                    )}
                    {sectionBlock.paragraphs.map((para, pIdx) => (
                      <p
                        key={pIdx}
                        className={
                          bIdx === 0 && pIdx === 0
                            ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-[#1E48B8] first-letter:float-left first-letter:mr-3 first-letter:mt-1'
                            : ''
                        }
                      >
                        {para}
                      </p>
                    ))}
                    {sectionBlock.callout && (
                      <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-5 my-5 font-sans">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E48B8] mb-2.5">
                          {sectionBlock.callout.title}
                        </h3>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-[#111111] list-disc pl-5">
                          {sectionBlock.callout.items.map((cItem, cIdx) => (
                            <li key={cIdx}>{cItem}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}

                {/* Editorial Pull Quote */}
                <blockquote className="my-8 py-6 px-6 bg-[#EEF2FB]/70 border-t border-b border-[#1E48B8]">
                  <p className="font-serif text-xl sm:text-2xl italic text-[#111111] leading-relaxed">
                    “{article.pullQuote.quote}”
                  </p>
                  <footer className="mt-3 text-xs font-sans font-semibold uppercase tracking-wider text-[#1F44A8]">
                    — {article.pullQuote.attribution}
                  </footer>
                </blockquote>
              </div>

              {/* Primary Sources & Peer-Reviewed References */}
              <section
                aria-labelledby="sources-references-heading"
                className="mt-10 pt-6 border-t-2 border-[#111111]"
              >
                <h2
                  id="sources-references-heading"
                  className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-4"
                >
                  Primary Sources &amp; Peer-Reviewed References
                </h2>
                <ol className="space-y-3 text-xs sm:text-sm font-sans text-neutral-800 list-decimal pl-5">
                  {article.primarySources.map((src) => (
                    <li key={src.id} className="leading-relaxed">
                      <strong className="font-semibold text-[#111111]">{src.title}</strong>.{' '}
                      <em>{src.journalOrInstitution}</em> ({src.publicationDate}). Study Design:{' '}
                      {src.studyDesign}
                      {src.sampleSize ? ` (${src.sampleSize})` : ''}. Primary Link / DOI:{' '}
                      <a
                        href={src.doiOrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="editorial-link font-mono text-xs break-all"
                      >
                        {src.doiOrUrl}
                      </a>
                    </li>
                  ))}
                </ol>

                {article.tags.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#E5E5E0] flex flex-wrap items-center gap-2 text-xs font-sans">
                    <span className="font-bold uppercase tracking-wider text-neutral-500">
                      Indexed Topics:
                    </span>
                    {article.tags.map((tag) => {
                      const tagSlug = tag
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                      return (
                        <Link
                          key={tag}
                          href={`/tags/${tagSlug}`}
                          className="px-2.5 py-1 bg-[#FAFAF7] border border-[#E5E5E0] text-[#1F44A8] font-medium hover:border-[#1E48B8]"
                        >
                          {tag}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Author & Reviewer Credentials Card */}
              <section
                aria-label="Author and Medical Reviewer Disclosures"
                className="mt-8 bg-white border border-[#E5E5E0] p-5 space-y-4 text-xs font-sans"
              >
                {author && (
                  <div>
                    <h3 className="font-bold text-sm text-[#111111]">
                      About the Author:{' '}
                      <Link
                        href={`/authors/${author.slug}`}
                        className="text-[#1F44A8] underline hover:text-[#111111]"
                      >
                        {author.name}, {author.credentials}
                      </Link>
                    </h3>
                    <p className="text-neutral-700 mt-1 leading-relaxed">{author.bio}</p>
                    <p className="text-neutral-500 mt-1 italic">
                      Disclosure: {author.conflictOfInterestDisclosure}
                    </p>
                  </div>
                )}
                {reviewer && (
                  <div className="pt-3 border-t border-[#E5E5E0]">
                    <h3 className="font-bold text-sm text-[#111111]">
                      Medical Review Verification:{' '}
                      <Link
                        href={`/authors/${reviewer.slug}`}
                        className="text-[#1F44A8] underline hover:text-[#111111]"
                      >
                        {reviewer.name}, {reviewer.credentials}
                      </Link>
                    </h3>
                    <p className="text-neutral-700 mt-1">
                      {reviewer.role} · {reviewer.institution}. ORCID: {reviewer.orcid}
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t border-[#E5E5E0] text-[11px] text-neutral-500 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Canonical URL: <code className="font-mono">{canonicalUrl}</code>
                  </span>
                  <span>Cryptographic Provenance Watermark Active</span>
                </div>
              </section>
            </div>

            {/* Right Sidebar: Related Clinical Explainers (pSEO) & Related Articles */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-white border border-[#E5E5E0] p-5">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] border-b border-[#E5E5E0] pb-2 mb-4">
                  Related Clinical Explainers (pSEO)
                </h2>
                <ul className="space-y-4">
                  {relatedPseoPages.map((p) => (
                    <li key={p.slug} className="border-b border-[#E5E5E0] last:border-b-0 pb-3 last:pb-0">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 block">
                        {p.category.replace('-', ' ')} · {p.dsmOrIcdCode}
                      </span>
                      <Link
                        href={p.urlPath}
                        className="font-serif text-sm font-bold text-[#1F44A8] hover:underline block mt-0.5"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-[#E5E5E0] p-5">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#111111] border-b border-[#E5E5E0] pb-2 mb-4">
                  Related Reporting
                </h2>
                <ul className="space-y-4">
                  {relatedArticles.map((rel) => (
                    <li
                      key={rel.slug}
                      className="border-b border-[#E5E5E0] last:border-b-0 pb-3 last:pb-0"
                    >
                      <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
                        {rel.locationDateline}
                      </span>
                      <Link
                        href={`/articles/${rel.slug}`}
                        className="font-serif text-sm font-bold text-[#111111] hover:text-[#1F44A8] leading-snug block mt-0.5"
                      >
                        {rel.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </article>

        <div className="my-12">
          <NewsletterBlock variant="royal-blue" />
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
