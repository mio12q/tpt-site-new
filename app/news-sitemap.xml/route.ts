import { NextResponse } from 'next/server';
import { BRAND_CONFIG, publicationService } from '@/lib/services/publication-service';
import { escapeHtmlEntities } from '@/lib/security';

export async function GET() {
  const allArticles = publicationService.getAllArticles();
  // Filter to articles published in the last 48 hours relative to reference date 2026-10-28T21:38:00Z
  const referenceNow = new Date('2026-10-28T21:38:00.000Z').getTime();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;
  const recentArticles = allArticles.filter(
    (art) => referenceNow - new Date(art.publishedAt).getTime() <= fortyEightHoursMs
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentArticles
  .map(
    (art) => `  <url>
    <loc>${BRAND_CONFIG.canonicalBase}/articles/${art.slug}</loc>
    <lastmod>${art.updatedAt}</lastmod>
    <news:news>
      <news:publication>
        <news:name>${escapeHtmlEntities(BRAND_CONFIG.siteName)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${art.publishedAt}</news:publication_date>
      <news:title>${escapeHtmlEntities(art.title)}</news:title>
      <news:keywords>${escapeHtmlEntities(art.tags.join(', '))}</news:keywords>
    </news:news>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  });
}
