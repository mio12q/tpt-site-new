import { NextResponse } from 'next/server';
import { BRAND_CONFIG } from '@/lib/services/publication-service';

export async function GET() {
  const txt = `# Therapist Psychologist Today (TherapistPsychologistToday.com)
# Verified Search Engine Crawler Policy & Anti-Scraping Rules

User-agent: Googlebot
Allow: /
Disallow: /secretadmin2026here
Disallow: /api/admin

User-agent: Googlebot-News
Allow: /
Disallow: /secretadmin2026here

User-agent: Bingbot
Allow: /
Disallow: /secretadmin2026here
Disallow: /api/admin

# Block aggressive bulk AI / content scrapers
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Scrapy
Disallow: /

User-agent: *
Allow: /
Disallow: /secretadmin2026here
Disallow: /api/admin

Sitemap: ${BRAND_CONFIG.canonicalBase}/sitemap.xml
Sitemap: ${BRAND_CONFIG.canonicalBase}/news-sitemap.xml
`;

  return new NextResponse(txt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
