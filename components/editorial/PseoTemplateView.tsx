import React from 'react';
import { headers } from 'next/headers';
import Link from 'next/link';
import type { PseoPage } from '@/lib/domain/types';
import { EditorialHeader } from '../layout/EditorialHeader';
import { EditorialFooter } from '../layout/EditorialFooter';
import { MedicalDisclaimerStrip } from './MedicalDisclaimerStrip';
import { NewsletterBlock } from './NewsletterBlock';
import { BRAND_CONFIG, publicationService } from '@/lib/services/publication-service';

export async function PseoTemplateView({ page }: { page: PseoPage }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const author = publicationService.getAuthorBySlug(page.authorSlug);
  const reviewer = publicationService.getAuthorBySlug(page.reviewerSlug);
  const relatedArticles = page.relatedArticleSlugs
    .map((s) => publicationService.getArticleBySlug(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const reviewedDateFormatted = new Date(page.lastReviewedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: page.title,
      description: page.metaDescription,
      url: page.canonicalUrl,
      lastReviewed: page.lastReviewedAt,
      dateModified: page.updatedAt,
      code: page.dsmOrIcdCode
        ? {
            '@type': 'MedicalCode',
            codeValue: page.dsmOrIcdCode,
            codingSystem: 'DSM-5-TR / ICD-11',
          }
        : undefined,
      author: author
        ? {
            '@type': 'Person',
            name: `${author.name}, ${author.credentials}`,
            url: `${BRAND_CONFIG.canonicalBase}/authors/${author.slug}`,
          }
        : undefined,
      reviewedBy: reviewer
        ? {
            '@type': 'Person',
            name: `${reviewer.name}, ${reviewer.credentials}`,
            url: `${BRAND_CONFIG.canonicalBase}/authors/${reviewer.slug}`,
          }
        : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
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
          name: 'Clinical Encyclopedia (pSEO)',
          item: `${BRAND_CONFIG.canonicalBase}/directory`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: page.title,
          item: page.canonicalUrl,
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
        {/* Breadcrumb */}
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
                Clinical Encyclopedia (pSEO)
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold uppercase tracking-wider text-[#1E48B8]">
              {page.category.replace('-', ' ')}
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-500 truncate max-w-xs" aria-current="page">
              {page.title}
            </li>
          </ol>
        </nav>

        <MedicalDisclaimerStrip
          lastReviewedAt={page.lastReviewedAt}
          reviewerName={reviewer?.name}
          reviewerCredentials={reviewer?.credentials}
          reviewerSlug={reviewer?.slug}
        />

        {/* Header */}
        <header className="mt-6 border-b-2 border-[#111111] pb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2">
            <span>{page.category.replace('-', ' ')} Explainer</span>
            {page.dsmOrIcdCode && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-neutral-700">{page.dsmOrIcdCode}</span>
              </>
            )}
            {page.evidenceGrade && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-neutral-600">{page.evidenceGrade}</span>
              </>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] leading-tight text-balance">
            {page.title}
          </h1>

          <p className="mt-3 font-serif text-lg text-neutral-700 leading-relaxed max-w-4xl">
            {page.subtitle}
          </p>

          <div className="mt-4 pt-3 border-t border-[#E5E5E0] flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-neutral-600">
            <div className="flex flex-wrap items-center gap-2">
              {author && (
                <span>
                  Authored by{' '}
                  <Link
                    href={`/authors/${author.slug}`}
                    className="font-semibold text-[#111111] underline hover:text-[#1F44A8]"
                  >
                    {author.name}, {author.credentials}
                  </Link>
                </span>
              )}
              <span aria-hidden="true">·</span>
              {reviewer && (
                <span>
                  Medically reviewed by{' '}
                  <Link
                    href={`/authors/${reviewer.slug}`}
                    className="font-semibold text-[#1F44A8] underline hover:text-[#111111]"
                  >
                    {reviewer.name}, {reviewer.credentials}
                  </Link>
                </span>
              )}
            </div>
            <span className="font-mono text-[11px]">
              Last reviewed: <time dateTime={page.lastReviewedAt}>{reviewedDateFormatted}</time>
            </span>
          </div>
        </header>

        {/* Main 12-Column Structured Content Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {/* Clinical Overview & Neurobiological Mechanism */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-2">
                Clinical Overview &amp; Pathophysiology
              </h2>
              <p className="font-serif text-base sm:text-[17px] text-[#111111] leading-[1.8]">
                {page.clinicalSummary}
              </p>
              <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-5">
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2">
                  Neurobiological &amp; Circuit Mechanism
                </h3>
                <p className="font-serif text-sm sm:text-base text-[#111111] leading-relaxed">
                  {page.neurobiologicalMechanism}
                </p>
              </div>
            </section>

            {/* Diagnostic Criteria / Clinical Protocol Steps */}
            <section className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-2">
                Diagnostic Criteria &amp; Clinical Evaluation Standards
              </h2>
              <ul className="space-y-2.5 font-serif text-base text-[#111111] leading-relaxed list-disc pl-5">
                {page.diagnosticOrClinicalCriteria.map((crit, i) => (
                  <li key={i}>{crit}</li>
                ))}
              </ul>
            </section>

            {/* Quantitative Epidemiology & Clinical Trial Metrics Table */}
            <section className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-2">
                Epidemiological Data &amp; Clinical Trial Metrics
              </h2>
              <div className="overflow-x-auto border border-[#E5E5E0] bg-white">
                <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
                  <thead>
                    <tr className="bg-[#EEF2FB] border-b border-[#E5E5E0] text-[#111111]">
                      <th className="py-3 px-4 font-bold">Clinical Metric / Endpoint</th>
                      <th className="py-3 px-4 font-bold">Estimate / Effect Size</th>
                      <th className="py-3 px-4 font-bold">Primary Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E0]">
                    {page.epidemiologyAndMetrics.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-4 font-medium text-[#111111]">{row.metric}</td>
                        <td className="py-3 px-4 font-mono tabular-nums font-bold text-[#1F44A8]">
                          {row.value}
                          {row.confidenceInterval ? ` (${row.confidenceInterval})` : ''}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{row.clinicalReference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Evidence-Based Treatment Protocols */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-2">
                Evidence-Based Clinical Protocols &amp; Guidelines
              </h2>
              <div className="space-y-4">
                {page.treatmentOrClinicalProtocols.map((tx, idx) => (
                  <div key={idx} className="bg-white border border-[#E5E5E0] p-5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                      <h3 className="font-serif text-lg font-bold text-[#1E48B8]">{tx.name}</h3>
                      <span className="text-xs font-mono text-neutral-500">
                        {tx.durationOrDosage}
                      </span>
                    </div>
                    <p className="font-serif text-sm text-[#111111] leading-relaxed">
                      {tx.efficacySummary}
                    </p>
                    <p className="mt-2 text-[11px] font-sans text-neutral-500">
                      Guideline Authority: {tx.guidelineSource}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Clinician-Verified FAQ Section (Structured with FAQPage Schema) */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-2">
                Frequently Asked Clinical Questions
              </h2>
              <div className="space-y-4">
                {page.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-[#EEF2FB]/60 border border-[#1E48B8]/20 p-5">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#111111]">
                      {faq.question}
                    </h3>
                    <p className="mt-2 font-serif text-sm sm:text-base text-neutral-800 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Primary Literature Citations */}
            <section className="pt-4 border-t-2 border-[#111111]">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-3">
                Primary Sources &amp; Guideline References
              </h2>
              <ol className="space-y-2 text-xs font-sans text-neutral-700 list-decimal pl-5">
                {page.primarySources.map((src) => (
                  <li key={src.id}>
                    <strong className="text-[#111111]">{src.title}</strong> —{' '}
                    <em>{src.journalOrInstitution}</em> ({src.publicationDate}).{' '}
                    <a
                      href={src.doiOrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editorial-link font-mono"
                    >
                      {src.doiOrUrl}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Right Sidebar: Internal Links & Related News */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E5E5E0] p-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] border-b border-[#E5E5E0] pb-2 mb-4">
                Related Clinical Guides
              </h2>
              <ul className="space-y-3">
                {page.relatedPseoPaths.map((rel) => (
                  <li key={rel.urlPath} className="border-b border-[#E5E5E0] last:border-b-0 pb-2.5 last:pb-0">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-neutral-500 block">
                      {rel.category.replace('-', ' ')}
                    </span>
                    <Link
                      href={rel.urlPath}
                      className="font-serif text-sm font-bold text-[#1F44A8] hover:underline"
                    >
                      {rel.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E5E5E0] p-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#111111] border-b border-[#E5E5E0] pb-2 mb-4">
                Latest News on This Topic
              </h2>
              <ul className="space-y-3.5">
                {relatedArticles.map((art) => (
                  <li key={art.slug} className="border-b border-[#E5E5E0] last:border-b-0 pb-3 last:pb-0">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
                      {art.locationDateline}
                    </span>
                    <Link
                      href={`/articles/${art.slug}`}
                      className="font-serif text-sm font-bold text-[#111111] hover:text-[#1F44A8] leading-snug block mt-0.5"
                    >
                      {art.title}
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
