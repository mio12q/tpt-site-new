export type TrafficClassification =
  | 'verified_search_crawler'
  | 'blocked_scraper'
  | 'rate_limited_bot'
  | 'legitimate_reader';

const OFFICIAL_SEARCH_BOT_USER_AGENTS = [
  'googlebot',
  'google-inspectiontool',
  'googleother',
  'adsbot-google',
  'apis-google',
  'mediapartners-google',
  'bingbot',
  'adidxbot',
  'msnbot',
  'applebot',
  'duckduckbot',
  'slurp',
  'yandexbot',
];

const OFFICIAL_SEARCH_RDNS_SUFFIXES = [
  '.googlebot.com',
  '.google.com',
  '.googleusercontent.com',
  '.search.msn.com',
  '.applebot.apple.com',
  '.duckduckgo.com',
  '.crawl.yahoo.net',
  '.yandex.com',
  '.yandex.ru',
  '.yandex.net',
];

const BLOCKED_SCRAPER_SIGNATURES = [
  'scrapy',
  'python-requests',
  'python-urllib',
  'go-http-client',
  'curl',
  'wget',
  'httrack',
  'mj12bot',
  'ahrefsbot',
  'semrushbot',
  'bytespider',
  'ccbot',
  'gptbot',
  'claudebot',
  'anthropic-ai',
  'omgilibot',
  'petalbot',
  'dotbot',
  'blexbot',
];

export const PRODUCTION_READER_RPM_LIMIT = 90;
export const PRODUCTION_UNVERIFIED_BOT_RPM_LIMIT = 60;
export const PREVIEW_READER_RPM_LIMIT = 10_000;
export const PREVIEW_UNVERIFIED_BOT_RPM_LIMIT = 5_000;

/**
 * Returns rate-limit thresholds based on environment.
 * In production, strict limits (90 RPM reader / 60 RPM unverified search bot) are enforced.
 * When NODE_ENV is not "production", much higher limits are used because the preview proxy
 * sends all requests from a single shared IP.
 */
export function getEffectiveRateLimits(
  env: Record<string, string | undefined> = process.env
): {
  maxReaderRpm: number;
  maxUnverifiedSearchBotRpm: number;
} {
  const isProd = env.NODE_ENV === 'production';
  return {
    maxReaderRpm: isProd ? PRODUCTION_READER_RPM_LIMIT : PREVIEW_READER_RPM_LIMIT,
    maxUnverifiedSearchBotRpm: isProd
      ? PRODUCTION_UNVERIFIED_BOT_RPM_LIMIT
      : PREVIEW_UNVERIFIED_BOT_RPM_LIMIT,
  };
}

/**
 * Identifies Next.js internal/HMR paths and static asset requests (/_next/*, images, fonts, CSS/JS)
 * so they are never counted by the page rate limiter or blocked by bot middleware.
 */
export function isStaticOrHmrRequest(pathname: string): boolean {
  const p = (pathname || '').toLowerCase();
  if (
    p.startsWith('/_next/') ||
    p === '/_next' ||
    p.startsWith('/__nextjs') ||
    p.startsWith('/assets/') ||
    p === '/favicon.ico' ||
    p === '/icon.png' ||
    p === '/logo-blue.png' ||
    p === '/logo-white.png' ||
    p === '/brain-icon.png'
  ) {
    return true;
  }
  return /\.(?:png|jpg|jpeg|jfif|gif|webp|avif|svg|ico|css|js|mjs|map|woff|woff2|ttf|otf|eot)$/i.test(
    p
  );
}

/**
 * Classifies incoming traffic based on User-Agent, request rate (req/min),
 * and optional verified reverse-DNS hostname.
 *
 * Rules:
 * 1. Legitimate search engine User-Agents (Googlebot, Bingbot, Applebot, DuckDuckBot, etc.):
 *    - If verifiedReverseDnsHost is provided and matches official search engine rDNS suffixes,
 *      returns 'verified_search_crawler'.
 *    - If verifiedReverseDnsHost is provided and does NOT match official search engine rDNS suffixes
 *      (proven spoofed Googlebot/Bingbot), returns 'blocked_scraper'.
 *    - If verifiedReverseDnsHost is omitted (Edge middleware before Node rDNS check),
 *      never blocks the crawler; rate-limits ('rate_limited_bot') only if requestsPerMinute > maxUnverifiedSearchBotRpm
 *      to safely throttle spoofed floods without blocking real Googlebot.
 * 2. Known bulk scraper User-Agents (scrapy, python-requests, curl, bytespider, ccbot, etc.):
 *    - Immediately returns 'blocked_scraper'.
 * 3. High-velocity page crawlers (requestsPerMinute > maxReaderRpm):
 *    - Returns 'rate_limited_bot'.
 * 4. All normal visitors:
 *    - Returns 'legitimate_reader'.
 */
export function classifyBotTraffic(params: {
  userAgent: string;
  requestsPerMinute?: number;
  verifiedReverseDnsHost?: string;
  maxReaderRpm?: number;
  maxUnverifiedSearchBotRpm?: number;
}): TrafficClassification {
  const ua = (params.userAgent || '').toLowerCase();
  const dns = (params.verifiedReverseDnsHost || '').trim().toLowerCase().replace(/\.$/, '');
  const rpm = params.requestsPerMinute ?? 0;
  const maxReaderRpm = params.maxReaderRpm ?? PRODUCTION_READER_RPM_LIMIT;
  const maxUnverifiedSearchBotRpm =
    params.maxUnverifiedSearchBotRpm ?? PRODUCTION_UNVERIFIED_BOT_RPM_LIMIT;

  const claimsSearchBot = OFFICIAL_SEARCH_BOT_USER_AGENTS.some((sig) => ua.includes(sig));

  if (claimsSearchBot) {
    if (dns) {
      const isOfficialRdns = OFFICIAL_SEARCH_RDNS_SUFFIXES.some((suffix) =>
        dns.endsWith(suffix)
      );
      if (isOfficialRdns) {
        return 'verified_search_crawler';
      }
      // Proven spoofed search crawler via reverse-DNS mismatch
      return 'blocked_scraper';
    }

    // When reverse-DNS has not been resolved yet (e.g. Edge runtime),
    // never block legitimate search crawlers; safely rate-limit only if flooding.
    if (rpm > maxUnverifiedSearchBotRpm) {
      return 'rate_limited_bot';
    }
    return 'verified_search_crawler';
  }

  if (BLOCKED_SCRAPER_SIGNATURES.some((sig) => ua.includes(sig))) {
    return 'blocked_scraper';
  }

  if (rpm > maxReaderRpm) {
    return 'rate_limited_bot';
  }

  return 'legitimate_reader';
}

/**
 * Sitemap files, robots.txt, RSS feed, and core brand logo/icon files
 * must NEVER be blocked or rate-limited.
 */
export function isAlwaysAllowedSeoOrLogoPath(pathname: string): boolean {
  const p = (pathname || '').toLowerCase();
  if (
    p === '/robots.txt' ||
    p === '/rss.xml' ||
    p === '/sitemap.xml' ||
    p === '/news-sitemap.xml' ||
    /^\/sitemap_\d+\.xml$/.test(p) ||
    p === '/logo-blue.png' ||
    p === '/logo-white.png' ||
    p === '/brain-icon.png' ||
    p === '/icon.png' ||
    p === '/favicon.ico'
  ) {
    return true;
  }
  return false;
}

/**
 * Evaluates whether a request to /assets/* is allowed based on the Referer header.
 * - Requests with NO Referer header are allowed (direct navigation, privacy browsers, email clients).
 * - Requests whose Referer hostname matches our own domain (TherapistPsychologistToday.com,
 *   the current request Host header, localhost, or APP_URL) are allowed.
 * - Requests with an external Referer header are blocked (returns false) to prevent hotlinking.
 */
export function isAssetRefererAllowed(params: {
  referer?: string | null;
  requestHost?: string | null;
  appUrl?: string | null;
}): boolean {
  const rawReferer = (params.referer || '').trim();
  if (!rawReferer) {
    return true;
  }

  let refererUrl: URL;
  try {
    refererUrl = new URL(rawReferer);
  } catch {
    return false;
  }

  const refHostname = refererUrl.hostname.toLowerCase();
  const refHostWithPort = refererUrl.host.toLowerCase();

  // Always allow our canonical brand domain and subdomains
  if (
    refHostname === 'therapistpsychologisttoday.com' ||
    refHostname.endsWith('.therapistpsychologisttoday.com') ||
    refHostname === 'localhost' ||
    refHostname === '127.0.0.1'
  ) {
    return true;
  }

  // Allow matching current request Host header
  if (params.requestHost) {
    const cleanReqHost = params.requestHost.trim().toLowerCase();
    const cleanReqHostname = cleanReqHost.split(':')[0];
    if (refHostWithPort === cleanReqHost || refHostname === cleanReqHostname) {
      return true;
    }
  }

  // Allow matching APP_URL environment variable
  const envAppUrl = params.appUrl ?? process.env.APP_URL;
  if (envAppUrl) {
    try {
      const parsedApp = new URL(envAppUrl);
      if (
        refHostname === parsedApp.hostname.toLowerCase() ||
        refHostWithPort === parsedApp.host.toLowerCase()
      ) {
        return true;
      }
    } catch {
      // ignore unparseable APP_URL
    }
  }

  return false;
}

// ============================================================================
// SLIDING-WINDOW PER-IP PAGE REQUEST RATE TRACKER (60-SECOND WINDOW)
// ============================================================================

const pageRateBuckets = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;

export function recordPageRequestAndGetRpm(
  ipAddress: string,
  nowMs: number = Date.now(),
  pathname?: string
): number {
  const key = (ipAddress || 'unknown').trim() || 'unknown';
  const cutoff = nowMs - RATE_WINDOW_MS;
  const existing = pageRateBuckets.get(key) || [];
  const active = existing.filter((t) => t > cutoff);

  // Never count static assets (/_next/*, images, fonts, CSS/JS) or SEO/logo files in the rate limiter
  if (pathname && (isStaticOrHmrRequest(pathname) || isAlwaysAllowedSeoOrLogoPath(pathname))) {
    pageRateBuckets.set(key, active);
    return active.length;
  }

  active.push(nowMs);
  pageRateBuckets.set(key, active);

  // Periodic map pruning to prevent unbounded growth
  if (pageRateBuckets.size > 5000) {
    for (const [k, timestamps] of pageRateBuckets.entries()) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        pageRateBuckets.delete(k);
      } else {
        pageRateBuckets.set(k, filtered);
      }
    }
  }

  return active.length;
}

export function resetPageRateBucketsForTesting(): void {
  pageRateBuckets.clear();
}

