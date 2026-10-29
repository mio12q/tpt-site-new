import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AdminConsoleClient } from '@/components/admin/AdminConsoleClient';
import {
  BRAND_CONFIG,
  getSitemapChunks,
  getTotalProgrammaticPageCount,
  publicationService,
} from '@/lib/services/publication-service';
import { appendAuditLog, extractClientIp, verifyIpAllowlist } from '@/lib/security';

export const dynamic = 'force-dynamic';

// Hidden Admin Route: Strictly noindex, nofollow, noarchive, excluded from sitemap
export const metadata: Metadata = {
  title: 'Sign In — Therapist Psychologist Today',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function SecretAdminPage() {
  const reqHeaders = await headers();
  const clientIp = extractClientIp({ headers: reqHeaders });

  if (!verifyIpAllowlist(clientIp)) {
    appendAuditLog({
      actorUsername: 'unauthenticated',
      actorRole: 'unauthenticated',
      action: 'admin_page:ip_blocked',
      resource: '/secretadmin2026here',
      ipAddress: clientIp,
      status: 'denied',
      details: 'Page access blocked: client IP not in ADMIN_IP_ALLOWLIST.',
    });

    return (
      <main className="min-h-screen bg-[#FAFAF7] text-[#111111] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border-2 border-[#111111] p-6 text-center space-y-2">
          <h1 className="font-serif text-xl font-bold text-[#111111]">403 Forbidden</h1>
          <p className="text-xs font-sans text-neutral-600">
            Access to this route is restricted by IP allowlist policy.
          </p>
        </div>
      </main>
    );
  }

  const initialArticles = publicationService.getAllArticles();
  const authors = publicationService.getAuthors();
  const sections = publicationService.getSections();
  const pseoCorePages = publicationService.getCorePseoPages();
  const totalPseoCount = getTotalProgrammaticPageCount();
  const chunks = getSitemapChunks(1000).map((c) => ({
    chunkIndex: c.chunkIndex,
    filename: c.filename,
    count: c.entries.length,
    lastmod: c.lastmod,
  }));

  return (
    <AdminConsoleClient
      initialArticles={initialArticles}
      authors={authors}
      sections={sections}
      pseoCorePages={pseoCorePages}
      totalPseoCount={totalPseoCount}
      sitemapChunks={chunks}
      canonicalBase={BRAND_CONFIG.canonicalBase}
    />
  );
}
