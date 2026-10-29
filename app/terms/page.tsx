import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';

export const metadata: Metadata = {
  title: 'Terms of Use, Copyright Notice & Anti-Scraping Policy',
  description:
    'Terms of use, medical non-advice disclaimer, cryptographic content watermarking notice, and anti-scraping restrictions for Therapist Psychologist Today.',
  alternates: { canonical: 'https://therapistpsychologisttoday.com/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <article className="bg-white border border-[#E5E5E0] p-6 sm:p-10 space-y-6">
          <header className="border-b-2 border-[#111111] pb-5">
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
              Legal &amp; Content Protection Governance
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
              Terms of Use, Copyright Notice &amp; Anti-Scraping Policy
            </h1>
          </header>

          <div className="space-y-4 font-serif text-base text-[#111111] leading-relaxed">
            <h2 className="text-xl font-bold">1. Informational Purpose Only (No Medical Advice)</h2>
            <p>
              All articles, programmatic clinical guides, figures, and glossary entries published on{' '}
              <strong>TherapistPsychologistToday.com</strong> are provided strictly for general
              informational and educational purposes. Nothing on this site creates a
              physician-patient or psychotherapist-client relationship.
            </p>

            <h2 className="text-xl font-bold">
              2. Copyright Ownership
            </h2>
            <p>
              © {new Date().getFullYear()} Therapist Psychologist Today. All original journalism, clinical synthesis tables, and graphics are protected under United States and international copyright law. Copying, republishing, scraping, or using this content to train AI systems without prior written permission is prohibited.
            </p>

            <h2 className="text-xl font-bold">
              3. Prohibition on Bulk Scraping &amp; Unauthorized AI Harvesting
            </h2>
            <p>
              Search engine crawlers are welcome in accordance with our robots.txt file and sitemaps. Automated bulk harvesting, scraping, unauthorized AI training use, and image hotlinking are prohibited, and we may block or restrict access to protect our content. Our RSS feed publishes article excerpts only.
            </p>
          </div>
        </article>
      </main>
      <EditorialFooter />
    </div>
  );
}
