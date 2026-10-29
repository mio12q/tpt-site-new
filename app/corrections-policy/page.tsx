import React from 'react';
import type { Metadata } from 'next';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';

export const metadata: Metadata = {
  title: 'Corrections, Clarifications & Retractions Policy',
  description:
    'Transparent scientific and factual corrections policy for Therapist Psychologist Today.',
  alternates: { canonical: 'https://therapistpsychologisttoday.com/corrections-policy' },
};

export default function CorrectionsPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <article className="bg-white border border-[#E5E5E0] p-6 sm:p-10 space-y-6">
          <header className="border-b-2 border-[#111111] pb-5">
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
              Accountability &amp; Public Record
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
              Corrections, Clarifications &amp; Retraction Policy
            </h1>
          </header>

          <div className="space-y-4 font-serif text-base text-[#111111] leading-relaxed">
            <p>
              In medical journalism, factual precision can directly affect clinical understanding.
              <em> Therapist Psychologist Today</em> is committed to correcting any factual,
              statistical, diagnostic, or citation error promptly and transparently on the public
              record.
            </p>
            <h2 className="text-xl font-bold">How Corrections Are Issued</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Factual &amp; Statistical Corrections:</strong> When an error in sample
                size, p-value, confidence interval, medication dosage, or institutional affiliation
                is identified, the article text is updated immediately and a timestamped{' '}
                <em>Correction Notice</em> is appended to the bottom of the article and logged in
                our audit trail.
              </li>
              <li>
                <strong>Journal Retraction Alerts:</strong> If an underlying peer-reviewed study
                cited by our publication is subsequently retracted or issued an Expression of
                Concern by its publishing journal, we update our coverage within 24 hours with a
                prominent clinical notice.
              </li>
            </ul>
            <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-5 font-sans text-xs sm:text-sm">
              <strong className="text-[#1E48B8] uppercase tracking-wider block mb-1">
                Report a Factual or Clinical Error
              </strong>
              Readers, researchers, and clinicians may submit correction requests with primary DOI
              documentation to the Office of the Public Editor &amp; Medical Review Chair at{' '}
              <code className="font-mono font-semibold">corrections@therapistpsychologisttoday.com</code>.
            </div>
          </div>
        </article>
      </main>
      <EditorialFooter />
    </div>
  );
}
