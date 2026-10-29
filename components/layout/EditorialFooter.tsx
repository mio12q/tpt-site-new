import React from 'react';
import Link from 'next/link';
import { SECTIONS } from '@/lib/data/editorial-data';
import { MastheadWordmark } from '../brand/BrandLogo';

export function EditorialFooter() {
  return (
    <footer className="bg-[#1E48B8] text-white border-t-4 border-[#111111] mt-16">
      {/* Discreet Crisis Support Strip */}
      <div className="bg-[#173994] border-b border-white/15 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans text-blue-100">
          <p>
            <strong className="font-semibold text-white">
              Immediate Psychiatric Crisis Support:
            </strong>{' '}
            If you or someone you know is experiencing a mental health crisis, call or text{' '}
            <strong className="text-white underline">988</strong> (United States &amp; Canada), call{' '}
            <strong className="text-white">999 / 111</strong> (United Kingdom), or{' '}
            <strong className="text-white">112</strong> (Europe).
          </p>
          <Link
            href="/crisis-resources"
            className="text-white font-semibold underline hover:text-blue-200 whitespace-nowrap shrink-0"
          >
            International Crisis Helplines &amp; Safety Planning →
          </Link>
        </div>
      </div>

      {/* Main Footer Grid with White-on-Blue Brand Logo */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="pb-8 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link href="/" aria-label="Therapist Psychologist Today Home">
              <MastheadWordmark variant="white-on-blue" />
            </Link>
            <p className="mt-2 text-xs sm:text-sm font-serif text-blue-100 max-w-xl">
              Therapist Psychologist Today (TherapistPsychologistToday.com) — Independent medical
              journalism, clinical research reporting, and structured reference guides.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/rss.xml"
              className="px-3.5 py-2 border border-white/40 text-xs font-sans font-semibold uppercase tracking-wider text-white hover:bg-white hover:text-[#1E48B8] transition-colors whitespace-nowrap"
            >
              RSS Excerpts Feed
            </Link>
            <Link
              href="/sitemap.xml"
              className="px-3.5 py-2 border border-white/40 text-xs font-sans font-semibold uppercase tracking-wider text-white hover:bg-white hover:text-[#1E48B8] transition-colors whitespace-nowrap"
            >
              Sitemap Index (XML)
            </Link>
            <Link
              href="/news-sitemap.xml"
              className="px-3.5 py-2 border border-white/40 text-xs font-sans font-semibold uppercase tracking-wider text-white hover:bg-white hover:text-[#1E48B8] transition-colors whitespace-nowrap"
            >
              Google News Sitemap
            </Link>
          </div>
        </div>

        {/* 5-Column Directory Links */}
        <div className="py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-xs font-sans">
          <div>
            <h3 className="font-bold uppercase tracking-widest text-blue-200 mb-3">
              Editorial Sections
            </h3>
            <ul className="space-y-2">
              {SECTIONS.map((sec) => (
                <li key={sec.slug}>
                  <Link
                    href={`/section/${sec.slug}`}
                    className="text-white/90 hover:text-white hover:underline"
                  >
                    {sec.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-widest text-blue-200 mb-3">
              Condition Explainers
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/conditions/major-depressive-disorder"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Major Depressive Disorder
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions/generalized-anxiety-disorder"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Generalized Anxiety Disorder
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions/post-traumatic-stress-disorder-ptsd"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  PTSD &amp; Complex PTSD
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions/bipolar-disorder"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Bipolar Spectrum Disorder
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions/postpartum-depression"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Postpartum Depression
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions/borderline-personality-disorder"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Borderline Personality Disorder
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-widest text-blue-200 mb-3">
              Treatment Explainers
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/treatments/cognitive-behavioral-therapy-cbt"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Cognitive Behavioral Therapy (CBT)
                </Link>
              </li>
              <li>
                <Link
                  href="/treatments/dialectical-behavior-therapy-dbt"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Dialectical Behavior Therapy (DBT)
                </Link>
              </li>
              <li>
                <Link
                  href="/treatments/emdr-therapy"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  EMDR Trauma Therapy
                </Link>
              </li>
              <li>
                <Link
                  href="/treatments/transcranial-magnetic-stimulation-tms"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Transcranial Magnetic Stimulation (TMS)
                </Link>
              </li>
              <li>
                <Link
                  href="/glossary/anhedonia"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Medical Glossary: Anhedonia
                </Link>
              </li>
              <li>
                <Link
                  href="/glossary/vagus-nerve-autonomic-regulation"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Glossary: Vagus Nerve
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-widest text-blue-200 mb-3">
              Reference Hubs
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/directory"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Clinical Reference Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/anxiety-disorders-clinical-research"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Topic Hub: Anxiety Research
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/neuroinflammation-metabolic-psychiatry"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Topic Hub: Metabolic Psychiatry
                </Link>
              </li>
              <li>
                <Link
                  href="/studies/neuro-metab-04-glp1-depression-trial-methodology"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Study Explainer Template
                </Link>
              </li>
              <li>
                <Link
                  href="/faq/suicidal-ideation-crisis-intervention"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Clinical FAQ: 988 &amp; Safety Planning
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-widest text-blue-200 mb-3">
              Trust, Ethics &amp; Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/editorial-policy"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Editorial Policy &amp; Ethics
                </Link>
              </li>
              <li>
                <Link
                  href="/medical-review-process"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Clinical Review Process
                </Link>
              </li>
              <li>
                <Link
                  href="/corrections-policy"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Corrections Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/authors/author-placeholder"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Author &amp; Reviewer Profiles
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/90 hover:text-white hover:underline">
                  Terms of Use &amp; Anti-Scraping Notice
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="text-white/90 hover:text-white hover:underline">
                  DMCA &amp; Copyright Takedown
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Medical Disclaimer Notice */}
        <div className="pt-6 border-t border-white/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-[11px] font-sans text-blue-100">
          <p>
            © {new Date().getFullYear()} Therapist Psychologist Today
            (TherapistPsychologistToday.com). All rights reserved. Automated bulk scraping,
            unauthorized AI training ingestion, and image hotlinking are strictly prohibited.
          </p>
          <p className="shrink-0">
            Information Only · Not Medical Advice, Diagnosis, or Treatment.
          </p>
        </div>
      </div>
    </footer>
  );
}
