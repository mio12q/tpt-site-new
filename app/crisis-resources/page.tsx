import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PhoneCall, Globe, ShieldCheck } from 'lucide-react';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';

export const metadata: Metadata = {
  title: '988 & International Psychiatric Crisis Helplines',
  description:
    'Immediate, free, confidential 24/7 crisis support resources in the United States (988), Canada, United Kingdom, Europe, Australia, and worldwide.',
  alternates: { canonical: 'https://therapistpsychologisttoday.com/crisis-resources' },
};

export default function CrisisResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <EditorialHeader />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <article className="bg-white border border-[#E5E5E0] p-6 sm:p-10 space-y-6">
          <header className="border-b-2 border-[#1E48B8] pb-5">
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
              24/7 Confidential Emergency &amp; Crisis Support
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
              Immediate Psychiatric Crisis &amp; Suicide Prevention Resources
            </h1>
            <p className="mt-2 font-serif text-base text-neutral-700">
              If you or someone you know is in immediate physical danger, please call your local
              emergency services (<strong>911</strong> in the US/Canada, <strong>999</strong> in the
              UK, <strong>112</strong> in Europe) or go to the nearest hospital emergency
              department.
            </p>
          </header>

          {/* Primary US/Canada 988 Box */}
          <div className="bg-[#EEF2FB] border-2 border-[#1E48B8] p-6">
            <div className="flex items-start gap-3">
              <PhoneCall className="w-6 h-6 text-[#1E48B8] shrink-0 mt-1" aria-hidden="true" />
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  United States &amp; Canada: Call or Text 988
                </h2>
                <p className="font-serif text-sm sm:text-base text-neutral-800 mt-1 leading-relaxed">
                  The <strong>988 Suicide &amp; Crisis Lifeline</strong> provides free, confidential,
                  24/7 support by phone or text in English and Spanish. Veterans and service members
                  may press <strong>1</strong> after dialing 988 (or text <strong>838255</strong>)
                  to reach the Veterans Crisis Line.
                </p>
                <p className="font-sans text-xs text-neutral-600 mt-2">
                  Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong> · The
                  Trevor Project (LGBTQ Youth): Call <strong>1-866-488-7386</strong> or text{' '}
                  <strong>START</strong> to <strong>678-678</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* International Crisis Directory Table */}
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#111111] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#1E48B8]" aria-hidden="true" />
              <span>International Crisis &amp; Emergency Helplines</span>
            </h2>
            <div className="overflow-x-auto border border-[#E5E5E0]">
              <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
                <thead>
                  <tr className="bg-[#FAFAF7] border-b border-[#E5E5E0] text-[#111111]">
                    <th className="py-3 px-4 font-bold">Country / Region</th>
                    <th className="py-3 px-4 font-bold">Primary Crisis Service</th>
                    <th className="py-3 px-4 font-bold">Direct Number / Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0]">
                  <tr>
                    <td className="py-3 px-4 font-semibold">United Kingdom</td>
                    <td className="py-3 px-4">NHS Mental Health Services / Samaritans</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1F44A8]">
                      Call 111 (NHS) or 116 123 (Samaritans)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Australia</td>
                    <td className="py-3 px-4">Lifeline Australia / Beyond Blue</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1F44A8]">
                      Call 13 11 14 · Emergency 000
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">European Union</td>
                    <td className="py-3 px-4">Pan-European Emergency &amp; Emotional Support</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1F44A8]">
                      Call 112 (Emergency) or 116 123
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">New Zealand</td>
                    <td className="py-3 px-4">Need to Talk? / Lifeline Aotearoa</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1F44A8]">
                      Call or Text 1737 · 0800 543 354
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="pt-4 border-t border-[#E5E5E0] flex items-center justify-between text-xs font-sans">
            <span className="inline-flex items-center gap-1.5 text-neutral-600">
              <ShieldCheck className="w-4 h-4 text-[#1E48B8]" aria-hidden="true" />
              <span>Clinical Safety Protocol: Stanley-Brown 6-Step Safety Planning</span>
            </span>
            <Link
              href="/faq/suicidal-ideation-crisis-intervention"
              className="editorial-link font-bold"
            >
              Read Full Stanley-Brown Safety Planning Guide →
            </Link>
          </div>
        </article>
      </main>
      <EditorialFooter />
    </div>
  );
}
