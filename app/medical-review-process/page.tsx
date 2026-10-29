import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';
import { MedicalDisclaimerStrip } from '@/components/editorial/MedicalDisclaimerStrip';
import { AUTHORS } from '@/lib/data/editorial-data';

export const metadata: Metadata = {
  title: 'Clinical Review Process & Editorial Governance',
  description:
    'Clinical review workflow and primary-source verification process on Therapist Psychologist Today.',
  alternates: { canonical: 'https://therapistpsychologisttoday.com/medical-review-process' },
};

export default function MedicalReviewProcessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <MedicalDisclaimerStrip
          lastReviewedAt="2026-10-28T18:00:00.000Z"
          reviewerName="[Reviewer Name]"
          reviewerCredentials="[Credentials]"
          reviewerSlug="reviewer-placeholder"
        />
        <article className="bg-white border border-[#E5E5E0] p-6 sm:p-10 mt-6 space-y-6">
          <header className="border-b-2 border-[#111111] pb-5">
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
              Clinical Verification Architecture
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
              Clinical Review Process &amp; Verification Protocol
            </h1>
          </header>

          <div className="space-y-4 font-serif text-base text-[#111111] leading-relaxed">
            <p>
              [Clinical Review Process Description Placeholder: Describe how articles, condition
              explainers, treatment guides, and reference pages are reviewed and verified prior to
              publication on <strong>TherapistPsychologistToday.com</strong>.]
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs sm:text-sm my-6">
              <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-4">
                <strong className="text-[#1E48B8] uppercase tracking-wider block mb-1">
                  Stage 1 · Primary Literature Check
                </strong>
                [Stage 1 Placeholder: Verification of primary source citations and DOIs.]
              </div>
              <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-4">
                <strong className="text-[#1E48B8] uppercase tracking-wider block mb-1">
                  Stage 2 · Diagnostic &amp; Terminology Alignment
                </strong>
                [Stage 2 Placeholder: Cross-checking clinical terminology and diagnostic criteria.]
              </div>
              <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-4">
                <strong className="text-[#1E48B8] uppercase tracking-wider block mb-1">
                  Stage 3 · Reviewer Sign-Off
                </strong>
                [Stage 3 Placeholder: Review by designated clinical reviewer.]
              </div>
              <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-4">
                <strong className="text-[#1E48B8] uppercase tracking-wider block mb-1">
                  Stage 4 · Periodic Review Updates
                </strong>
                [Stage 4 Placeholder: Periodic re-verification and timestamp updates.]
              </div>
            </div>

            <h2 className="text-xl font-bold">Reviewer &amp; Author Placeholders</h2>
            <div className="space-y-4 pt-2">
              {AUTHORS.map((rev) => (
                <div key={rev.slug} className="border border-[#E5E5E0] p-4 bg-[#FAFAF7]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/authors/${rev.slug}`}
                      className="font-bold text-lg text-[#1F44A8] hover:underline"
                    >
                      {rev.name}, {rev.credentials}
                    </Link>
                    <span className="font-mono text-xs text-neutral-500">ORCID: {rev.orcid}</span>
                  </div>
                  <p className="text-xs font-sans text-neutral-600 mt-0.5">
                    {rev.role} · {rev.institution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </main>
      <EditorialFooter />
    </div>
  );
}
