import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';
import { MedicalDisclaimerStrip } from '@/components/editorial/MedicalDisclaimerStrip';
import { NewsletterBlock } from '@/components/editorial/NewsletterBlock';
import { BRAND_CONFIG, publicationService } from '@/lib/services/publication-service';
import type { SectionSlug } from '@/lib/domain/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = publicationService.getSectionBySlug(slug);
  if (!section) return { title: 'Section Not Found' };
  const canonicalUrl = `${BRAND_CONFIG.canonicalBase}/section/${section.slug}`;
  return {
    title: `${section.name} — Clinical News, Trials & Analysis`,
    description: section.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${section.name} | Therapist Psychologist Today`,
      description: section.description,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function SectionArchivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = publicationService.getSectionBySlug(slug);
  if (!section) notFound();

  const sectionArticles = publicationService.getArticlesBySection(section.slug as SectionSlug);
  const allPseoPages = publicationService.getCorePseoPages();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />

      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <header className="border-b-2 border-[#111111] pb-6 mb-8">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block mb-1">
            {section.leadNote}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#111111] tracking-tight">
            {section.name}
          </h1>
          <p className="mt-2 font-serif text-base sm:text-lg text-neutral-700 max-w-3xl">
            {section.description}
          </p>
        </header>

        <MedicalDisclaimerStrip
          lastReviewedAt="2026-10-28T18:00:00.000Z"
          reviewerName="[Reviewer Name]"
          reviewerCredentials="[Credentials]"
          reviewerSlug="reviewer-placeholder"
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {sectionArticles.map((art) => {
              const author = publicationService.getAuthorBySlug(art.authorSlug);
              const reviewer = publicationService.getAuthorBySlug(art.reviewerSlug);
              const pubDate = new Date(art.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });
              return (
                <article
                  key={art.slug}
                  className="bg-white border border-[#E5E5E0] p-6 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8]">
                    <span>{art.locationDateline}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-neutral-500 font-normal">{pubDate}</span>
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
                    <span aria-hidden="true">·</span>
                    <span>Primary Source: {art.primarySources[0]?.journalOrInstitution}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E5E5E0] p-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] border-b border-[#E5E5E0] pb-2 mb-4">
                Structured Clinical Guides in {section.name}
              </h2>
              <ul className="space-y-3.5">
                {allPseoPages.slice(0, 6).map((p) => (
                  <li key={p.slug} className="border-b border-[#E5E5E0] last:border-b-0 pb-2.5 last:pb-0">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-neutral-500 block">
                      {p.category.replace('-', ' ')} · {p.dsmOrIcdCode}
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
