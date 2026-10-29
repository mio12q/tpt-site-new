import { NextRequest, NextResponse } from 'next/server';
import { buildCspHeader, isPreviewFramingAllowed } from '@/lib/security/csp';
import {
  classifyBotTraffic,
  getEffectiveRateLimits,
  isAlwaysAllowedSeoOrLogoPath,
  isAssetRefererAllowed,
  isStaticOrHmrRequest,
  recordPageRequestAndGetRpm,
} from '@/lib/security/traffic-guard';

function getSafeMiddlewareClientIp(req: NextRequest): string {
  if (process.env.TRUST_CLOUDFLARE === 'true') {
    const cfIp = req.headers.get('cf-connecting-ip')?.trim();
    if (cfIp) return cfIp;
  }
  const directIp = (req as { ip?: string }).ip?.trim();
  return directIp || '127.0.0.1';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. Fast-path skip for Next.js internal /_next/* routes and HMR requests
  if (pathname.startsWith('/_next/') || pathname === '/_next' || pathname.startsWith('/__nextjs')) {
    return NextResponse.next();
  }

  // 1. Block external hotlinking on /assets/* image requests based on the Referer header
  //    while allowing requests with no Referer and requests from our own domain.
  //    Never count /assets/* in the page rate limiter.
  if (pathname.startsWith('/assets/')) {
    const referer = req.headers.get('referer');
    const requestHost = req.headers.get('x-forwarded-host') || req.headers.get('host');

    if (
      !isAssetRefererAllowed({
        referer,
        requestHost,
        appUrl: process.env.APP_URL,
      })
    ) {
      return new NextResponse('Forbidden: External hotlinking to /assets/* is prohibited.', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.next();
  }

  // 2. Do not run page rate-limiting or CSP headers on static files (images, icons, fonts, CSS, JS)
  if (isStaticOrHmrRequest(pathname)) {
    return NextResponse.next();
  }

  // 3. Never block sitemap files, robots.txt, the RSS feed, or the brand logo/icon files.
  //    For page requests, classify bot traffic and apply environment-appropriate rate limits.
  if (!isAlwaysAllowedSeoOrLogoPath(pathname) && !pathname.startsWith('/api/')) {
    const userAgent = req.headers.get('user-agent') || '';
    const clientIp = getSafeMiddlewareClientIp(req);
    const requestsPerMinute = recordPageRequestAndGetRpm(clientIp, Date.now(), pathname);
    const { maxReaderRpm, maxUnverifiedSearchBotRpm } = getEffectiveRateLimits();

    const classification = classifyBotTraffic({
      userAgent,
      requestsPerMinute,
      maxReaderRpm,
      maxUnverifiedSearchBotRpm,
    });

    if (classification === 'blocked_scraper') {
      return new NextResponse(
        'Forbidden: Automated scraping and unauthorized bot access are prohibited.',
        {
          status: 403,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    if (classification === 'rate_limited_bot') {
      return new NextResponse('Too Many Requests: Crawl rate limit exceeded.', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Retry-After': '60',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  // 4. Apply per-request cryptographic nonce and Content-Security-Policy header.
  //    Allow iframe framing ONLY when NODE_ENV !== "production" or ALLOW_PREVIEW_FRAMING="true".
  //    In production, strictly enforce frame-ancestors 'none' and X-Frame-Options: DENY.
  const nonce = btoa(crypto.randomUUID());
  const allowPreviewFraming = isPreviewFramingAllowed();
  const cspHeader = buildCspHeader(nonce, { allowPreviewFraming });

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);

  if (!allowPreviewFraming) {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/|__nextjs|favicon\\.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

