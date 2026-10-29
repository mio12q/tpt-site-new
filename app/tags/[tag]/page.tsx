import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';
import { MedicalDisclaimerStrip } from '@/components/editorial/MedicalDisclaimerStrip';
import { NewsletterBlock } from '@/components/editorial/NewsletterBlock';
import { BRAND_CONFIG, publicationService } from '@/lib/services/publication-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const { tagLabel } = publicationService.getArticlesByTag(tag);
  const canonicalUrl = `${BRAND_CONFIG.canonicalBase}/tags/${tag}`;
  return {
    title: `Latest News & Clinical Guides Tagged "${tagLabel}"`,
    description: `Clinical reporting, research dispatches, and reference guides tagged with ${tagLabel} on Therapist Psychologist Today.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${tagLabel} — Clinical Tag Archive | Therapist Psychologist Today`,
      description: `Clinical reporting, research dispatches, and reference guides tagged with ${tagLabel}.`,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function TagArchivePage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const { tagLabel, articles } = publicationService.getArticlesByTag(tag);
  const allTags = publicationService.getAllTags();
  const relatedPseo = publicationService.getCorePseoPages().slice(0, 6);
  const canonicalUrl = `${BRAND_CONFIG.canonicalBase}/tags/${tag}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Clinical Coverage Tagged: ${tagLabel}`,
      url: canonicalUrl,
      description: `Archive of articles and clinical reference guides related to ${tagLabel}.`,
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
          name: 'Clinical Directory',
          item: `${BRAND_CONFIG.canonicalBase}/directory`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `Tag: ${tagLabel}`,
          item: canonicalUrl,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EditorialHeader />

      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav aria-label="Breadcrumb" className="text-xs font-sans text-neutral-600 mb-4">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#1F44A8] hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/directory" className="hover:text-[#1F44A8] hover:underline">
                Directory
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-[#1E48B8]" aria-current="page">
              Tag: {tagLabel}
            </li>
          </ol>
        </nav>

        <header className="border-b-2 border-[#111111] pb-6 mb-6">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block mb-1">
            Programmatic Topic &amp; Tag Archive
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
            Clinical Dispatches &amp; Guides Tagged: &ldquo;{tagLabel}&rdquo;
          </h1>
          <p className="mt-2 font-serif text-base text-neutral-700 max-w-3xl">
            Curated news reporting, study methodology analyses, and structured reference pages
            indexed under <strong>{tagLabel}</strong>.
          </p>
        </header>

        <MedicalDisclaimerStrip lastReviewedAt="2026-10-28T18:00:00.000Z" />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {articles.map((art) => {
              const author = publicationService.getAuthorBySlug(art.authorSlug);
              const reviewer = publicationService.getAuthorBySlug(art.reviewerSlug);
              return (
                <article
                  key={art.slug}
                  className="bg-white border border-[#E5E5E0] p-6 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8]">
                    <Link href={`/section/${art.section}`} className="hover:underline">
                      {art.section.replace('-', ' ')}
                    </Link>
                    <span aria-hidden="true">·</span>
                    <span className="text-neutral-500 font-normal">{art.locationDateline}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#111111] leading-snug">
                    <Link href={`/articles/${art.slug}`} className="hover:text-[#1F44A8]">
                      {art.title}
                    </Link>
                  </h2>
                  <p className="font-serif text-sm sm:text-base text-neutral-700 leading-relaxed">
                    {art.subtitle}
                  </p>
                  <div className="pt-3 border-t border-[#E5E5E0] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-sans text-neutral-600">
                    {author && (
                      <span>
                        By{' '}
                        <Link
                          href={`/authors/${author.slug}`}
                          className="font-semibold text-[#111111] underline hover:text-[#1F44A8]"
                        >
                          {author.name}, {author.credentials}
                        </Link>
                      </span>
                    )}
                    {reviewer && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          Medically reviewed by {reviewer.name}, {reviewer.credentials}
                        </span>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E5E5E0] p-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] border-b border-[#E5E5E0] pb-2 mb-4">
                Related Clinical Guides
              </h2>
              <ul className="space-y-3">
                {relatedPseo.map((p) => (
                  <li
                    key={p.slug}
                    className="border-b border-[#E5E5E0] last:border-b-0 pb-2.5 last:pb-0"
                  >
                    <span className="text-[10px] font-sans uppercase tracking-wider text-neutral-500 block">
                      {p.category.replace('-', ' ')}
                    </span>
                    <Link
                      href={p.urlPath}
                      className="font-serif text-sm font-bold text-[#1F44A8] hover:underline"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E5E5E0] p-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#111111] border-b border-[#E5E5E0] pb-2 mb-4">
                All Clinical Topic Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tags/${t.slug}`}
                    className="px-2.5 py-1 bg-[#FAFAF7] border border-[#E5E5E0] text-xs font-sans font-medium text-[#1F44A8] hover:border-[#1E48B8]"
                  >
                    {t.tag} ({t.count})
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="my-12">
          <NewsletterBlock variant="light-tint" />
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
