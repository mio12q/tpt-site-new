import { NextResponse } from 'next/server';
import { BRAND_CONFIG, publicationService } from '@/lib/services/publication-service';
import { escapeHtmlEntities } from '@/lib/security';

export async function GET() {
  const articles = publicationService.getAllArticles();

  // Anti-Scraping Requirement: Publish EXCERPTS ONLY, never full article text
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtmlEntities(BRAND_CONFIG.siteName)} — Clinical Dispatches (Excerpts Only)</title>
    <link>${BRAND_CONFIG.canonicalBase}</link>
    <description>${escapeHtmlEntities(BRAND_CONFIG.tagline)}</description>
    <language>en-us</language>
    <copyright>Copyright ${new Date().getFullYear()} Therapist Psychologist Today. Excerpts only; full-text scraping prohibited.</copyright>
    <atom:link href="${BRAND_CONFIG.canonicalBase}/rss.xml" rel="self" type="application/rss+xml"/>
${articles
  .map(
    (art) => `    <item>
      <title>${escapeHtmlEntities(art.title)}</title>
      <link>${BRAND_CONFIG.canonicalBase}/articles/${art.slug}</link>
      <guid isPermaLink="true">${BRAND_CONFIG.canonicalBase}/articles/${art.slug}</guid>
      <pubDate>${new Date(art.publishedAt).toUTCString()}</pubDate>
      <description>${escapeHtmlEntities(art.excerpt)} [Excerpt only — Read full medically reviewed report at TherapistPsychologistToday.com]</description>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
