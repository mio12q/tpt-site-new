import React from 'react';
import type { Metadata } from 'next';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';

export const metadata: Metadata = {
  title: 'DMCA Copyright & Takedown Contact Page',
  description:
    'Digital Millennium Copyright Act (DMCA) designated agent, copyright infringement reporting, and anti-theft enforcement for Therapist Psychologist Today.',
  alternates: { canonical: 'https://therapistpsychologisttoday.com/dmca' },
};

export default function DmcaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <article className="bg-white border border-[#E5E5E0] p-6 sm:p-10 space-y-6">
          <header className="border-b-2 border-[#111111] pb-5">
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
              Intellectual Property Protection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
              DMCA Takedown Notice &amp; Copyright Enforcement
            </h1>
          </header>

          <div className="space-y-4 font-serif text-base text-[#111111] leading-relaxed">
            <p>
              <em>Therapist Psychologist Today</em> respects intellectual property rights and
              vigorously enforces its own copyrights against unauthorized republication or content
              scraping under 17 U.S.C. § 512 (Digital Millennium Copyright Act).
            </p>

            <h2 className="text-xl font-bold">Filing a DMCA Notice or Reporting Stolen Content</h2>
            <p>
              To submit a formal DMCA notification or to report unauthorized mirroring of
              TherapistPsychologistToday.com articles (verified by our embedded zero-width
              cryptographic ownership watermarks and canonical tags), please provide the following
              to our Designated Copyright Agent:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>
                Identification of the copyrighted work claimed to have been infringed, including the
                original canonical URL on TherapistPsychologistToday.com.
              </li>
              <li>
                Identification of the infringing material and its exact URL location sufficient to
                permit verification.
              </li>
              <li>
                Contact information (full legal name, institutional affiliation, postal address,
                telephone number, and email address).
              </li>
              <li>
                A statement under penalty of perjury that the complaining party is authorized to act
                on behalf of the copyright owner.
              </li>
            </ol>

            <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-5 font-sans text-xs sm:text-sm">
              <strong className="text-[#1E48B8] uppercase tracking-wider block mb-1">
                Designated DMCA Copyright Agent
              </strong>
              Office of General Counsel &amp; Content Protection · Therapist Psychologist Today
              <br />
              Email: <code className="font-mono font-semibold">dmca@therapistpsychologisttoday.com</code>
            </div>
          </div>
        </article>
      </main>
      <EditorialFooter />
    </div>
  );
}
