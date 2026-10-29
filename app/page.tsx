import React from 'react';
import Link from 'next/link';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';
import { ClinicalFigure } from '@/components/editorial/ClinicalFigure';
import { NewsletterBlock } from '@/components/editorial/NewsletterBlock';
import { MedicalDisclaimerStrip } from '@/components/editorial/MedicalDisclaimerStrip';
import {
  publicationService,
  getTotalProgrammaticPageCount,
} from '@/lib/services/publication-service';

export default function HomePage() {
  const leadArticle = publicationService.getLeadArticle();
  const secondaryArticles = publicationService.getSecondaryArticles();
  const allArticles = publicationService.getAllArticles();
  const opinionArticles = publicationService.getOpinionArticles();
  const mostReadArticles = publicationService.getMostReadArticles();
  const corePseoPages = publicationService.getCorePseoPages();
  const totalPseoCount = getTotalProgrammaticPageCount();

  const leadAuthor = publicationService.getAuthorBySlug(leadArticle.authorSlug);
  const leadReviewer = publicationService.getAuthorBySlug(leadArticle.reviewerSlug);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />

      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Breaking Dispatches Ribbon */}
        <section
          aria-label="Breaking Clinical Dispatches"
          className="border-b border-[#E5E5E0] pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-sans">
            <span className="font-bold uppercase tracking-widest text-[#1E48B8]">
              Breaking Dispatches
            </span>
            <span aria-hidden="true" className="text-neutral-300">
              ·
            </span>
            {allArticles.slice(0, 3).map((art, idx) => {
              const timeStr = new Date(art.publishedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'UTC',
              });
              return (
                <React.Fragment key={art.slug}>
                  {idx > 0 && (
                    <span aria-hidden="true" className="text-neutral-300 hidden sm:inline">
                      /
                    </span>
                  )}
                  <Link
                    href={`/articles/${art.slug}`}
                    className="hover:text-[#1F44A8] hover:underline inline-flex items-baseline gap-1.5"
                  >
                    <span className="font-mono tabular-nums text-[11px] font-semibold text-[#1F44A8] whitespace-nowrap shrink-0">
                      {timeStr} UTC
                    </span>
                    <span className="text-[#111111] font-medium line-clamp-1 max-w-xs">
                      {art.title}
                    </span>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
          <Link
            href="/news-sitemap.xml"
            className="text-[11px] font-sans font-semibold text-[#1F44A8] hover:underline whitespace-nowrap shrink-0"
          >
            48-Hr Google News Feed →
          </Link>
        </section>

        {/* Primary Front-Page Broadsheet 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b-2 border-[#111111]">
          {/* Left / Center 8 Columns: Lead Story + Secondary Stories */}
          <div className="lg:col-span-8 lg:pr-8 lg:border-r border-[#E5E5E0] space-y-8">
            {/* Lead Story */}
            <article className="border-b border-[#E5E5E0] pb-8">
              <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2">
                <Link href={`/section/${leadArticle.section}`} className="hover:underline">
                  {leadArticle.section.replace('-', ' & ')}
                </Link>
                <span aria-hidden="true" className="text-neutral-400">
                  ·
                </span>
                <span className="text-neutral-600 font-normal">
                  {leadArticle.locationDateline}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#111111] leading-[1.15] tracking-tight text-balance">
                <Link
                  href={`/articles/${leadArticle.slug}`}
                  className="hover:text-[#1F44A8] transition-colors"
                >
                  {leadArticle.title}
                </Link>
              </h1>

              <p className="mt-3 font-serif text-base sm:text-lg text-neutral-700 leading-relaxed">
                {leadArticle.subtitle}
              </p>

              {/* Byline & Medical Review Trust Metadata */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-sans text-neutral-600">
                {leadAuthor && (
                  <span>
                    By{' '}
                    <Link
                      href={`/authors/${leadAuthor.slug}`}
                      className="font-semibold text-[#111111] hover:text-[#1F44A8] underline"
                    >
                      {leadAuthor.name}, {leadAuthor.credentials}
                    </Link>
                  </span>
                )}
                <span aria-hidden="true">·</span>
                {leadReviewer && (
                  <span>
                    Medically reviewed by{' '}
                    <Link
                      href={`/authors/${leadReviewer.slug}`}
                      className="font-semibold text-[#1F44A8] hover:underline"
                    >
                      {leadReviewer.name}, {leadReviewer.credentials}
                    </Link>
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {leadArticle.readingTimeMinutes} min read
                </span>
              </div>

              {/* Lead Story Scientific Graphic (Loaded Eagerly Above the Fold) */}
              <ClinicalFigure figure={leadArticle.figure} priority />

              {/* Lead Story Key Clinical Findings Summary */}
              <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-4 mt-4">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2">
                  Key Clinical Trial Findings
                </h2>
                <ul className="space-y-1.5 text-xs sm:text-sm font-serif text-[#111111] list-disc pl-5">
                  {leadArticle.keyTakeaways.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            {/* Two-Column Secondary Feature Stories Under Lead */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {secondaryArticles.map((secArt, idx) => {
                const author = publicationService.getAuthorBySlug(secArt.authorSlug);
                const reviewer = publicationService.getAuthorBySlug(secArt.reviewerSlug);
                return (
                  <article
                    key={secArt.slug}
                    className={
                      idx === 0
                        ? 'md:pr-6 md:border-r border-[#E5E5E0] flex flex-col justify-between'
                        : 'flex flex-col justify-between'
                    }
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-1.5">
                        <Link href={`/section/${secArt.section}`} className="hover:underline">
                          {secArt.section.replace('-', ' ')}
                        </Link>
                        <span aria-hidden="true" className="text-neutral-400">
                          ·
                        </span>
                        <span className="text-neutral-500 font-normal">
                          {secArt.locationDateline}
                        </span>
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111] leading-snug text-balance">
                        <Link
                          href={`/articles/${secArt.slug}`}
                          className="hover:text-[#1F44A8] transition-colors"
                        >
                          {secArt.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-sm font-serif text-neutral-700 leading-relaxed">
                        {secArt.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E5E5E0] text-[11px] font-sans text-neutral-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                      {author && (
                        <span>
                          By{' '}
                          <Link
                            href={`/authors/${author.slug}`}
                            className="font-semibold text-[#111111] hover:text-[#1F44A8]"
                          >
                            {author.name}, {author.credentials}
                          </Link>
                        </span>
                      )}
                      {reviewer && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Reviewed by {reviewer.name}, {reviewer.credentials}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {secArt.readingTimeMinutes} min read
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right 4 Columns: Breaking/Latest with Timestamps + Expert Voices/Opinion + Most Read */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Breaking / Latest News Feed with Timestamps */}
            <section
              aria-labelledby="latest-wire-heading"
              className="border-b border-[#E5E5E0] pb-6"
            >
              <div className="flex items-center justify-between border-b-2 border-[#1E48B8] pb-2 mb-4">
                <h2
                  id="latest-wire-heading"
                  className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8]"
                >
                  Latest Clinical Dispatches
                </h2>
                <span className="text-[11px] font-mono text-neutral-500">UTC Desk Wire</span>
              </div>

              <ul className="divide-y divide-[#E5E5E0]">
                {allArticles.map((art) => {
                  const timeFormatted = new Date(art.publishedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC',
                  });
                  return (
                    <li key={art.slug} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-baseline gap-2.5">
                        <time
                          dateTime={art.publishedAt}
                          className="font-mono tabular-nums text-[11px] font-bold text-[#1F44A8] shrink-0"
                        >
                          {timeFormatted}
                        </time>
                        <div>
                          <Link
                            href={`/articles/${art.slug}`}
                            className="font-serif text-sm font-bold text-[#111111] hover:text-[#1F44A8] leading-snug block"
                          >
                            {art.title}
                          </Link>
                          <div className="mt-1 text-[11px] font-sans text-neutral-500 flex items-center gap-1.5">
                            <span>{art.locationDateline}</span>
                            <span aria-hidden="true">·</span>
                            <span>{art.primarySources[0]?.journalOrInstitution}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Expert Voices / Opinion Strip */}
            <section
              aria-labelledby="opinion-strip-heading"
              className="border-b border-[#E5E5E0] pb-6"
            >
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2 mb-4">
                <h2
                  id="opinion-strip-heading"
                  className="text-xs font-sans font-bold uppercase tracking-widest text-[#111111]"
                >
                  Expert Voices &amp; Clinical Opinion
                </h2>
                <Link
                  href="/section/opinion"
                  className="text-[11px] font-sans font-semibold text-[#1F44A8] hover:underline"
                >
                  All Essays →
                </Link>
              </div>

              {opinionArticles.map((opArt) => {
                const opAuthor = publicationService.getAuthorBySlug(opArt.authorSlug);
                return (
                  <article key={opArt.slug} className="bg-[#EEF2FB] p-4 border border-[#1E48B8]/25">
                    {opAuthor && (
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div>
                          <Link
                            href={`/authors/${opAuthor.slug}`}
                            className="text-xs font-sans font-bold uppercase tracking-wider text-[#1F44A8] hover:underline block"
                          >
                            {opAuthor.name}, {opAuthor.credentials}
                          </Link>
                          <span className="text-[11px] font-sans text-neutral-600 block">
                            {opAuthor.institution}
                          </span>
                        </div>
                      </div>
                    )}
                    <h3 className="font-serif text-lg font-bold text-[#111111] leading-snug">
                      <Link
                        href={`/articles/${opArt.slug}`}
                        className="hover:text-[#1F44A8] transition-colors"
                      >
                        “{opArt.title}”
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs font-serif italic text-neutral-700 leading-relaxed">
                      {opArt.pullQuote.quote}
                    </p>
                  </article>
                );
              })}
            </section>

            {/* Most Read Numbered List (Numbers in Royal Blue) */}
            <section aria-labelledby="most-read-heading">
              <div className="border-b-2 border-[#1E48B8] pb-2 mb-4 flex items-center justify-between">
                <h2
                  id="most-read-heading"
                  className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8]"
                >
                  Most Read by Clinicians
                </h2>
                <span className="text-[11px] font-sans text-neutral-500">Past 24 Hours</span>
              </div>

              <ol className="divide-y divide-[#E5E5E0]">
                {mostReadArticles.map((art, index) => (
                  <li key={art.slug} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5">
                    <span className="font-serif text-2xl font-bold tabular-nums text-[#1E48B8] leading-none mt-0.5 shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <Link
                        href={`/articles/${art.slug}`}
                        className="font-serif text-sm font-bold text-[#111111] hover:text-[#1F44A8] leading-snug block"
                      >
                        {art.title}
                      </Link>
                      <span className="text-[11px] font-sans text-neutral-500 mt-1 block">
                        {art.primarySources[0]?.journalOrInstitution} · {art.readingTimeMinutes} min
                        read
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        {/* Medical Information Disclaimer Strip */}
        <div className="my-6">
          <MedicalDisclaimerStrip
            lastReviewedAt="2026-10-28T18:15:00.000Z"
            reviewerName="[Reviewer Name]"
            reviewerCredentials="[Credentials]"
            reviewerSlug="reviewer-placeholder"
          />
        </div>

        {/* Multi-Column Section Blocks (Mental Health, Conditions, Treatments, Wellness) */}
        <section
          aria-labelledby="desk-reports-heading"
          className="py-8 border-b-2 border-[#111111]"
        >
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
                Department Desks
              </span>
              <h2
                id="desk-reports-heading"
                className="font-serif text-2xl sm:text-3xl font-bold text-[#111111]"
              >
                In-Depth Coverage Across Clinical Specialties
              </h2>
            </div>
            <Link
              href="/section/research-studies"
              className="text-xs font-sans font-bold uppercase tracking-wider text-[#1F44A8] hover:underline"
            >
              View All Desk Reports →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allArticles.slice(1, 5).map((art) => {
              const author = publicationService.getAuthorBySlug(art.authorSlug);
              return (
                <article
                  key={art.slug}
                  className="bg-white border border-[#E5E5E0] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2">
                      <Link href={`/section/${art.section}`} className="hover:underline">
                        {art.section.replace('-', ' ')}
                      </Link>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#111111] leading-snug">
                      <Link
                        href={`/articles/${art.slug}`}
                        className="hover:text-[#1F44A8] transition-colors"
                      >
                        {art.title}
                      </Link>
                    </h3>
                    <p className="mt-2.5 text-xs font-serif text-neutral-700 leading-relaxed line-clamp-4">
                      {art.subtitle}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E5E5E0] text-[11px] font-sans text-neutral-600">
                    {author && (
                      <span className="block font-medium text-[#111111]">
                        {author.name}, {author.credentials}
                      </span>
                    )}
                    <span className="text-neutral-500">
                      Source: {art.primarySources[0]?.journalOrInstitution}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Programmatic SEO (pSEO) Clinical Knowledge Base Showcase */}
        <section
          aria-labelledby="pseo-hub-heading"
          className="py-10 border-b border-[#E5E5E0]"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
                Structured Clinical Reference Architecture
              </span>
              <h2
                id="pseo-hub-heading"
                className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1"
              >
                Conditions, Treatments &amp; Medical Glossary
              </h2>
              <p className="text-sm font-serif text-neutral-700 mt-1 max-w-3xl">
                Structured templates for condition explainers, treatment explainers, study
                methodology summaries, glossary definitions, and clinical FAQs.
              </p>
            </div>
            <Link
              href="/directory"
              className="px-4 py-2.5 bg-[#1E48B8] text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#1E3A8A] transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
            >
              Explore Clinical Directory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corePseoPages.slice(0, 9).map((page) => (
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
                  <p className="mt-2 text-xs font-serif text-neutral-700 leading-relaxed line-clamp-3">
                    {page.clinicalSummary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5E5E0] flex items-center justify-between text-[11px] font-sans text-neutral-600">
                  <span>{page.evidenceGrade}</span>
                  <Link
                    href={page.urlPath}
                    className="font-semibold text-[#1F44A8] hover:underline"
                  >
                    Read Clinical Guide →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Signup Block */}
        <div className="my-10">
          <NewsletterBlock variant="light-tint" />
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
