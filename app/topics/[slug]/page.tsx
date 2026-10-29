import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PseoTemplateView } from '@/components/editorial/PseoTemplateView';
import { publicationService } from '@/lib/services/publication-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = publicationService.getPseoPage('topics', slug);
  if (!page) return { title: 'Topic Hub Not Found' };
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: page.canonicalUrl,
      type: 'website',
    },
  };
}

export default async function TopicHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = publicationService.getPseoPage('topics', slug);
  if (!page) notFound();
  return <PseoTemplateView page={page} />;
}
