import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { EditorialFooter } from '@/components/layout/EditorialFooter';
import { BRAND_CONFIG, publicationService } from '@/lib/services/publication-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = publicationService.getAuthorBySlug(slug);
  if (!author) return { title: 'Clinician Profile Not Found' };
  const canonicalUrl = `${BRAND_CONFIG.canonicalBase}/authors/${author.slug}`;
  return {
    title: `${author.name}, ${author.credentials} — ${author.role}`,
    description: author.bio,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${author.name}, ${author.credentials} | Therapist Psychologist Today`,
      description: author.bio,
      url: canonicalUrl,
      type: 'profile',
    },
  };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const author = publicationService.getAuthorBySlug(slug);
  if (!author) notFound();

  const allArticles = publicationService.getAllArticles();
  const authoredArticles = allArticles.filter((a) => a.authorSlug === author.slug);
  const reviewedArticles = allArticles.filter((a) => a.reviewerSlug === author.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${author.name}, ${author.credentials}`,
    jobTitle: author.role,
    affiliation: {
      '@type': 'Organization',
      name: author.institution,
    },
    description: author.bio,
    identifier: author.orcid,
    url: `${BRAND_CONFIG.canonicalBase}/authors/${author.slug}`,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#111111]">
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EditorialHeader />

      <main className="flex-1 max-w-[1080px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white border border-[#E5E5E0] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E0] pb-6">
            <div>
              <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
                {author.isMedicalReviewer
                  ? '[Medical Reviewer Role Placeholder]'
                  : '[Author Role Placeholder]'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
                {author.name}, {author.credentials}
              </h1>
              <p className="text-sm font-sans font-medium text-neutral-700 mt-1">
                {author.role} · {author.institution}
              </p>
            </div>
            <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 px-4 py-3 text-xs font-mono text-[#111111] shrink-0">
              <div>ORCID: {author.orcid}</div>
              <div>Publications: [Count Placeholder]</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8]">
                Biography &amp; Academic Background
              </h2>
              <p className="font-serif text-base text-[#111111] leading-relaxed">{author.bio}</p>

              <div className="pt-2">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Education &amp; Credentials
                </h3>
                <ul className="space-y-1 text-xs sm:text-sm font-sans text-[#111111] list-disc pl-5">
                  {author.education.map((ed, i) => (
                    <li key={i}>{ed}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#EEF2FB] border border-[#1E48B8]/25 p-4">
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] mb-2">
                  Areas of Clinical Expertise
                </h3>
                <div className="flex flex-wrap gap-2 text-xs font-sans text-[#111111]">
                  {author.clinicalSpecialties.map((spec, i) => (
                    <span key={i} className="font-medium">
                      {spec}
                      {i < author.clinicalSpecialties.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAFAF7] border border-[#E5E5E0] p-4 text-xs font-sans">
                <h3 className="font-bold uppercase tracking-wider text-[#111111] mb-1">
                  Conflict of Interest Disclosure (ICMJE Standard)
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  {author.conflictOfInterestDisclosure}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authored & Medically Reviewed Articles */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] border-b-2 border-[#1E48B8] pb-2 mb-4">
              Reporting &amp; Essays by {author.name} ({authoredArticles.length})
            </h2>
            <ul className="space-y-4">
              {authoredArticles.map((art) => (
                <li key={art.slug} className="bg-white border border-[#E5E5E0] p-4">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-neutral-500 block">
                    {art.locationDateline} · {art.readingTimeMinutes} min read
                  </span>
                  <Link
                    href={`/articles/${art.slug}`}
                    className="font-serif text-base font-bold text-[#111111] hover:text-[#1F44A8] block mt-1"
                  >
                    {art.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#111111] border-b-2 border-[#111111] pb-2 mb-4">
              Peer-Reviewed &amp; Verified by {author.name} ({reviewedArticles.length})
            </h2>
            <ul className="space-y-4">
              {reviewedArticles.map((art) => (
                <li key={art.slug} className="bg-white border border-[#E5E5E0] p-4">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-[#1E48B8] block">
                    Medical Review Signed · Last reviewed{' '}
                    {new Date(art.lastReviewedAt).toLocaleDateString('en-US')}
                  </span>
                  <Link
                    href={`/articles/${art.slug}`}
                    className="font-serif text-base font-bold text-[#111111] hover:text-[#1F44A8] block mt-1"
                  >
                    {art.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
