import { NextResponse } from 'next/server';
import { BRAND_CONFIG, getSitemapChunks } from '@/lib/services/publication-service';

export async function GET() {
  const chunks = getSitemapChunks(1000);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunks
  .map(
    (c) => `  <sitemap>
    <loc>${BRAND_CONFIG.canonicalBase}${c.filename}</loc>
    <lastmod>${c.lastmod}</lastmod>
  </sitemap>`
  )
  .join('\n')}
  <sitemap>
    <loc>${BRAND_CONFIG.canonicalBase}/news-sitemap.xml</loc>
    <lastmod>2026-10-28T18:15:00.000Z</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
