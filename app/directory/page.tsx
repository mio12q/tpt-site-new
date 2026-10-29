'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';
import { MedicalDisclaimerStrip } from '@/components/editorial/MedicalDisclaimerStrip';
import {
  CORE_PSEO_PAGES,
  getSampleMatrixPages,
} from '@/lib/data/pseo-engine';
import { ARTICLES } from '@/lib/data/editorial-data';
import type { PseoCategory } from '@/lib/domain/types';

const CATEGORIES: { id: 'all' | PseoCategory; label: string }[] = [
  { id: 'all', label: 'All Clinical Pages' },
  { id: 'condition', label: 'Condition Explainers' },
  { id: 'treatment', label: 'Treatment Explainers' },
  { id: 'topic-hub', label: 'Topic Hubs' },
  { id: 'study-explainer', label: 'Study Explainers' },
  { id: 'glossary', label: 'Medical Glossary' },
  { id: 'faq', label: 'Clinical FAQs' },
];

function DirectoryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<'all' | PseoCategory>('all');

  const sampleMatrixPages = useMemo(() => getSampleMatrixPages(24), []);

  const filteredCorePages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CORE_PSEO_PAGES.filter((page) => {
      if (selectedCategory !== 'all' && page.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        page.title.toLowerCase().includes(q) ||
        page.subtitle.toLowerCase().includes(q) ||
        page.clinicalSummary.toLowerCase().includes(q) ||
        (page.dsmOrIcdCode && page.dsmOrIcdCode.toLowerCase().includes(q))
      );
    });
  }, [query, selectedCategory]);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <MedicalDisclaimerStrip
        lastReviewedAt="2026-10-28T18:00:00.000Z"
        reviewerName="[Reviewer Name]"
        reviewerCredentials="[Credentials]"
        reviewerSlug="reviewer-placeholder"
      />

      <header className="mt-6 border-b-2 border-[#111111] pb-6">
        <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block mb-1.5">
          Programmatic SEO (pSEO) Clinical Knowledge Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
          Medical Encyclopedia, Clinical Protocols &amp; Archive Directory
        </h1>
        <p className="mt-2 font-serif text-base sm:text-lg text-neutral-700 max-w-4xl">
          Browse structured clinical templates across conditions, treatment explainers, study
          methodology summaries, glossary definitions, and clinical FAQs.
        </p>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="tablist"
            aria-label="Filter by clinical page type"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#1E48B8] text-white border-[#1E48B8]'
                    : 'bg-white text-[#111111] border-[#E5E5E0] hover:border-[#1E48B8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-full lg:w-80">
            <label htmlFor="directory-filter-input" className="sr-only">
              Filter clinical guides and articles
            </label>
            <input
              id="directory-filter-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by condition, treatment, or topic..."
              className="w-full bg-white border border-[#E5E5E0] px-3.5 py-2 text-xs sm:text-sm font-sans text-[#111111] focus:outline-none focus:border-[#1E48B8]"
            />
          </div>
        </div>
      </header>

      {/* Matching Editorial News Articles when searching */}
      {query.trim().length > 0 && (
        <section className="py-6 border-b border-[#E5E5E0]">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-4">
            Matching Editorial News Articles ({filteredArticles.length})
          </h2>
          {filteredArticles.length === 0 ? (
            <p className="text-sm font-serif text-neutral-600">
              No news articles matched &ldquo;{query}&rdquo;. See matching clinical guides below.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((art) => (
                <article key={art.slug} className="bg-white border border-[#E5E5E0] p-4">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1E48B8]">
                    {art.section.replace('-', ' ')} · {art.locationDateline}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#111111] mt-1 leading-snug">
                    <Link href={`/articles/${art.slug}`} className="hover:text-[#1F44A8]">
                      {art.title}
                    </Link>
                  </h3>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Flagship Curated pSEO Clinical Pages */}
      <section className="py-8 border-b-2 border-[#111111]">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#111111]">
            Core Clinical Reference Guides ({filteredCorePages.length})
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            JSON-LD MedicalWebPage &amp; FAQPage Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCorePages.map((page) => (
            <article
              key={page.slug}
              className="bg-white border border-[#E5E5E0] p-5 flex flex-col justify-between hover:border-[#1E48B8] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] font-sans mb-2">
                  <span className="font-bold uppercase tracking-widest text-[#1E48B8]">
                    {page.category.replace('-', ' ')}
                  </span>
                  {page.dsmOrIcdCode && (
                    <span className="font-mono text-neutral-500 truncate max-w-[180px]">
                      {page.dsmOrIcdCode}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#111111] leading-snug">
                  <Link href={page.urlPath} className="hover:text-[#1F44A8]">
                    {page.title}
                  </Link>
                </h3>
                <p className="mt-2 text-xs font-serif text-neutral-700 leading-relaxed">
                  {page.subtitle}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5E5E0] flex items-center justify-between text-[11px] font-sans">
                <span className="text-neutral-500">
                  {page.epidemiologyAndMetrics[0]?.metric}
                </span>
                <Link
                  href={page.urlPath}
                  className="font-bold text-[#1F44A8] hover:underline whitespace-nowrap"
                >
                  Open Guide →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Combinatorial Structured Matrix Pages */}
      <section className="py-8 border-b border-[#E5E5E0]">
        <div className="mb-6">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
            Combinatorial pSEO Matrix
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
            Condition × Intervention × Population Clinical Protocol Matrix
          </h2>
          <p className="text-sm font-serif text-neutral-700 mt-1">
            Representative pages from the programmatic clinical matrix indexed across chunked XML
            sitemaps (<code className="font-mono">/sitemap_1.xml</code>,{' '}
            <code className="font-mono">/sitemap_2.xml</code>,{' '}
            <code className="font-mono">/sitemap_3.xml</code>).
          </p>
        </div>

        <div className="overflow-x-auto bg-white border border-[#E5E5E0]">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-[#EEF2FB] border-b border-[#E5E5E0] text-[#111111]">
                <th className="py-3 px-4 font-bold">Clinical Protocol Guide Title</th>
                <th className="py-3 px-4 font-bold">Condition</th>
                <th className="py-3 px-4 font-bold">Intervention</th>
                <th className="py-3 px-4 font-bold">Target Cohort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {sampleMatrixPages.map((row) => (
                <tr key={row.slug} className="hover:bg-[#FAFAF7]">
                  <td className="py-3 px-4 font-serif font-bold text-sm">
                    <Link href={row.urlPath} className="text-[#1F44A8] hover:underline">
                      {row.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-neutral-700">
                    {row.conditionLabel}{' '}
                    <span className="font-mono text-neutral-500">({row.icdCode})</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-700">{row.treatmentLabel}</td>
                  <td className="py-3 px-4 text-neutral-600">{row.populationLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* XML Sitemap Index & Crawler Verification Status */}
      <section className="my-8 bg-[#EEF2FB] border border-[#1E48B8]/25 p-6">
        <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2">
          Crawler &amp; Sitemap Chunk Architecture
        </h2>
        <p className="text-xs sm:text-sm font-serif text-[#111111] mb-4">
          Programmatic pages are automatically partitioned into chunked XML sitemaps with ISO-8601{' '}
          <code className="font-mono">lastmod</code> timestamps, plus a dedicated 48-hour Google
          News sitemap and excerpt-only RSS feed.
        </p>
        <div className="flex flex-wrap gap-3 text-xs font-mono">
          <Link
            href="/sitemap.xml"
            className="px-3 py-1.5 bg-white border border-[#1E48B8]/30 text-[#1F44A8] font-semibold hover:bg-[#1E48B8] hover:text-white transition-colors"
          >
            /sitemap.xml (Index)
          </Link>
          <Link
            href="/sitemap_1.xml"
            className="px-3 py-1.5 bg-white border border-[#1E48B8]/30 text-[#1F44A8] font-semibold hover:bg-[#1E48B8] hover:text-white transition-colors"
          >
            /sitemap_1.xml (Chunk 1)
          </Link>
          <Link
            href="/sitemap_2.xml"
            className="px-3 py-1.5 bg-white border border-[#1E48B8]/30 text-[#1F44A8] font-semibold hover:bg-[#1E48B8] hover:text-white transition-colors"
          >
            /sitemap_2.xml (Chunk 2)
          </Link>
          <Link
            href="/sitemap_3.xml"
            className="px-3 py-1.5 bg-white border border-[#1E48B8]/30 text-[#1F44A8] font-semibold hover:bg-[#1E48B8] hover:text-white transition-colors"
          >
            /sitemap_3.xml (Chunk 3)
          </Link>
          <Link
            href="/news-sitemap.xml"
            className="px-3 py-1.5 bg-white border border-[#1E48B8]/30 text-[#1F44A8] font-semibold hover:bg-[#1E48B8] hover:text-white transition-colors"
          >
            /news-sitemap.xml (48-Hr Google News)
          </Link>
          <Link
            href="/robots.txt"
            className="px-3 py-1.5 bg-white border border-[#1E48B8]/30 text-[#1F44A8] font-semibold hover:bg-[#1E48B8] hover:text-white transition-colors"
          >
            /robots.txt
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PseoDirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />
      <Suspense
        fallback={
          <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 py-12 font-serif text-sm text-neutral-600">
            Loading Clinical Directory...
          </main>
        }
      >
        <DirectoryContent />
      </Suspense>
      <EditorialFooter />
    </div>
  );
}
