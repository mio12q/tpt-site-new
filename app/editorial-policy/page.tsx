import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';
import { MedicalDisclaimerStrip } from '@/components/editorial/MedicalDisclaimerStrip';
import { AUTHORS } from '@/lib/data/editorial-data';

export const metadata: Metadata = {
  title: 'Editorial Policy & Journalistic Standards',
  description:
    'Editorial independence, primary-source verification, ICMJE conflict-of-interest standards, and clinical reporting rules at Therapist Psychologist Today.',
  alternates: { canonical: 'https://therapistpsychologisttoday.com/editorial-policy' },
};

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <MedicalDisclaimerStrip lastReviewedAt="2026-10-28T12:00:00.000Z" />
        <article className="bg-white border border-[#E5E5E0] p-6 sm:p-10 mt-6 space-y-6">
          <header className="border-b-2 border-[#111111] pb-5">
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
              Trust, Accuracy &amp; Journalistic Ethics
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
              Editorial Policy &amp; Standards of Primary-Source Verification
            </h1>
            <p className="text-xs font-mono text-neutral-500 mt-2">
              Effective Date: January 1, 2026 · Last Reviewed: October 28, 2026
            </p>
          </header>

          <div className="space-y-4 font-serif text-base text-[#111111] leading-relaxed">
            <h2 className="text-xl font-bold">1. Complete Editorial Independence</h2>
            <p>
              <em>Therapist Psychologist Today</em> (TherapistPsychologistToday.com) operates under
              strict separation between editorial decision-making and institutional or commercial
              entities. No pharmaceutical manufacturer, medical device company, or commercial
              telehealth platform may sponsor, preview, alter, or influence any news dispatch,
              condition explainer, treatment evaluation, or clinical study appraisal.
            </p>

            <h2 className="text-xl font-bold pt-2">2. Mandatory Primary-Source Citation Rule</h2>
            <p>
              Every medical or scientific claim published on TherapistPsychologistToday.com must
              cite its primary source directly (including Digital Object Identifier [DOI], study
              registration, sample size, study design, and methodology).
            </p>

            <h2 className="text-xl font-bold pt-2">
              3. Conflict-of-Interest Disclosures
            </h2>
            <p>
              Contributing authors and clinical reviewers provide conflict-of-interest disclosure
              statements displayed on every article and{' '}
              <Link href="/authors/author-placeholder" className="editorial-link">
                author biography page
              </Link>
              .
            </p>

            <h2 className="text-xl font-bold pt-2">4. Authors &amp; Reviewers (Placeholders)</h2>
            <ul className="space-y-2 list-disc pl-5 text-sm">
              {AUTHORS.map((a) => (
                <li key={a.slug}>
                  <Link href={`/authors/${a.slug}`} className="editorial-link font-bold">
                    {a.name}, {a.credentials}
                  </Link>{' '}
                  — {a.role} ({a.institution})
                </li>
              ))}
            </ul>
          </div>
        </article>
      </main>
      <EditorialFooter />
    </div>
  );
}
