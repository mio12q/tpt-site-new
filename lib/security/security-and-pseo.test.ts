import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  SESSION_ABSOLUTE_MAX_MS,
  SESSION_IDLE_TIMEOUT_MS,
  checkLoginRateLimit,
  classifyBotTraffic,
  clearLoginFailures,
  createSession,
  embedOwnershipWatermark,
  extractClientIp,
  generateTotpCode,
  hashPassword,
  hasPermission,
  invalidateSession,
  recordLoginFailure,
  sanitizePlainText,
  validateNewsletterSubmission,
  verifyCsrfToken,
  verifyIpAllowlist,
  verifyOwnershipWatermark,
  verifyPassword,
  verifySessionCookie,
  verifyTotpCode,
} from './index';
import {
  getSitemapChunks,
  getTotalProgrammaticPageCount,
  resolveDynamicPseoPage,
} from '../data/pseo-engine';

test('scrypt password hashing and constant-time verification succeed for valid password and reject wrong password', () => {
  const generatedValidPassword = `pw-${crypto.randomBytes(12).toString('hex')}`;
  const generatedWrongPassword = `pw-${crypto.randomBytes(12).toString('hex')}`;
  const hash = hashPassword(generatedValidPassword);
  assert.equal(hash.startsWith('$scrypt$n=16384,r=8,p=1$'), true);
  assert.equal(verifyPassword(generatedValidPassword, hash), true);
  assert.equal(verifyPassword(generatedWrongPassword, hash), false);
});

test('login rate limiting locks out account after 5 failed attempts for 15 minutes', () => {
  const key = 'test-ip-198.51.100.1:admin';
  clearLoginFailures(key);
  const now = 1700000000000;

  for (let i = 1; i <= 4; i++) {
    const res = recordLoginFailure(key, now + i * 1000);
    assert.equal(res.lockedOut, false);
    assert.equal(res.remainingAttempts, 5 - i);
  }

  const fifth = recordLoginFailure(key, now + 5000);
  assert.equal(fifth.lockedOut, true);
  assert.equal(fifth.remainingAttempts, 0);

  const checkDuringLockout = checkLoginRateLimit(key, now + 60000);
  assert.equal(checkDuringLockout.allowed, false);

  // After 15 minutes + 10s, lockout expires automatically
  const checkAfterExpiry = checkLoginRateLimit(key, now + 16 * 60 * 1000);
  assert.equal(checkAfterExpiry.allowed, true);
  clearLoginFailures(key);
});

test('TOTP 2FA verification accepts valid RFC 6238 code and rejects invalid code', () => {
  const generatedTotpSecret = crypto.randomBytes(20).toString('hex');
  const now = 1700000000000;
  const code = generateTotpCode(generatedTotpSecret, Math.floor(now / 30000));
  const invalidCode = code === '000000' ? '111111' : '000000';
  assert.equal(code.length, 6);
  assert.equal(verifyTotpCode(code, generatedTotpSecret, now), true);
  assert.equal(verifyTotpCode(invalidCode, generatedTotpSecret, now), false);
});

test('Safe client IP extraction trusts CF-Connecting-IP only when TRUST_CLOUDFLARE=true and verifyIpAllowlist enforces only when set', () => {
  const mockHeaders = {
    get(name: string) {
      if (name.toLowerCase() === 'cf-connecting-ip') return '203.0.113.50';
      if (name.toLowerCase() === 'x-forwarded-for') return '198.51.100.99';
      return null;
    },
  };

  // When trustCloudflare is false, CF-Connecting-IP and X-Forwarded-For are ignored in favor of directIp
  const ipUntrustedCf = extractClientIp({
    headers: mockHeaders,
    directIp: '192.0.2.10',
    trustCloudflare: false,
  });
  assert.equal(ipUntrustedCf, '192.0.2.10');

  // When trustCloudflare is true, CF-Connecting-IP is used
  const ipTrustedCf = extractClientIp({
    headers: mockHeaders,
    directIp: '192.0.2.10',
    trustCloudflare: true,
  });
  assert.equal(ipTrustedCf, '203.0.113.50');

  // verifyIpAllowlist allows all when allowlist is empty, and restricts when set
  assert.equal(verifyIpAllowlist('192.0.2.10', ''), true);
  assert.equal(verifyIpAllowlist('203.0.113.50', '203.0.113.50, 198.51.100.1'), true);
  assert.equal(verifyIpAllowlist('192.0.2.10', '203.0.113.50, 198.51.100.1'), false);
});

test('Session creation, sliding 30-minute idle timeout, 8-hour absolute max lifetime, CSRF validation, and logout invalidation', () => {
  const startMs = 1700000000000;
  const { signedCookieValue, session } = createSession(
    {
      id: 'u1',
      username: 'admin',
      displayName: '[Admin Name]',
      role: 'admin',
    },
    startMs
  );

  assert.equal(session.lastActivityAt, startMs);
  assert.equal(session.idleExpiresAt, startMs + SESSION_IDLE_TIMEOUT_MS);
  assert.equal(session.expiresAt, startMs + SESSION_ABSOLUTE_MAX_MS);

  // Activity at +20 minutes keeps session alive and slides lastActivityAt forward
  const step1Ms = startMs + 20 * 60 * 1000;
  const verified1 = verifySessionCookie(signedCookieValue, step1Ms);
  assert.ok(verified1);
  assert.equal(verified1?.lastActivityAt, step1Ms);

  // Activity at +45 minutes (25m after step1Ms, past original 30m mark) succeeds due to sliding window
  const step2Ms = startMs + 45 * 60 * 1000;
  const verified2 = verifySessionCookie(signedCookieValue, step2Ms);
  assert.ok(verified2);
  assert.equal(verified2?.lastActivityAt, step2Ms);
  assert.equal(verifyCsrfToken(verified2, session.csrfToken), true);
  assert.equal(verifyCsrfToken(verified2, 'forged_csrf_token'), false);

  // Inactivity for 31 minutes after step2Ms expires the session
  const idleExpiredMs = step2Ms + 31 * 60 * 1000;
  assert.equal(verifySessionCookie(signedCookieValue, idleExpiredMs), null);

  // Create a second session to verify the 8-hour absolute maximum lifetime
  const { signedCookieValue: cookie2 } = createSession(
    {
      id: 'u1',
      username: 'admin',
      displayName: '[Admin Name]',
      role: 'admin',
    },
    startMs
  );
  // Keep sliding every 20 minutes up to 7h 50m
  let t = startMs;
  while (t < startMs + 7 * 60 * 60 * 1000 + 50 * 60 * 1000) {
    t += 20 * 60 * 1000;
    assert.ok(verifySessionCookie(cookie2, t));
  }
  // At 8 hours + 1 second, session expires even though lastActivityAt was only 10 minutes ago
  const pastAbsoluteMaxMs = startMs + SESSION_ABSOLUTE_MAX_MS + 1000;
  assert.equal(verifySessionCookie(cookie2, pastAbsoluteMaxMs), null);

  // Verify explicit logout invalidation
  const { signedCookieValue: cookie3 } = createSession(
    {
      id: 'u1',
      username: 'admin',
      displayName: '[Admin Name]',
      role: 'admin',
    },
    startMs
  );
  invalidateSession(cookie3);
  assert.equal(verifySessionCookie(cookie3, startMs + 1000), null);
});

test('RBAC enforces server-side permissions across admin, editor, and author roles', () => {
  assert.equal(hasPermission('admin', 'users:manage'), true);
  assert.equal(hasPermission('editor', 'users:manage'), false);
  assert.equal(hasPermission('editor', 'pseo:manage'), true);
  assert.equal(hasPermission('author', 'pseo:manage'), false);
  assert.equal(hasPermission('author', 'articles:edit'), true);
});

test('XSS sanitization and newsletter honeypot bot defense', () => {
  const dirty = '<script>alert("xss")</script>Clinical <b>Update</b> onclick=evil()';
  const clean = sanitizePlainText(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('onclick='), false);

  const botAttempt = validateNewsletterSubmission({
    email: 'bot@example.com',
    honeypot: 'http://spam-link.example',
  });
  assert.equal(botAttempt.valid, false);
  assert.equal(botAttempt.isBot, true);

  const realUser = validateNewsletterSubmission({
    email: 'clinician@example.org',
    honeypot: '',
  });
  assert.equal(realUser.valid, true);
  assert.equal(realUser.sanitizedEmail, 'clinician@example.org');
});

test('Bot classification allows verified Googlebot/Bingbot and blocks spoofed or scraper bots', () => {
  assert.equal(
    classifyBotTraffic({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      verifiedReverseDnsHost: 'crawl-66-249-66-1.googlebot.com',
    }),
    'verified_search_crawler'
  );

  assert.equal(
    classifyBotTraffic({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
      verifiedReverseDnsHost: 'ec2-54-210-1-1.compute-1.amazonaws.com',
    }),
    'blocked_scraper'
  );

  assert.equal(
    classifyBotTraffic({
      userAgent: 'python-requests/2.31.0',
    }),
    'blocked_scraper'
  );
});

test('Zero-width ownership watermark embeds invisibly and verifies article provenance', () => {
  const slug = 'glp-1-receptor-agonists-neuroinflammation-depression-trials';
  const original = 'Clinical dispatch text with ownership watermark verification.';
  const watermarked = embedOwnershipWatermark(original, slug);
  assert.notEqual(watermarked, original);
  assert.equal(verifyOwnershipWatermark(watermarked, slug), true);
  assert.equal(verifyOwnershipWatermark(watermarked, 'different-article-slug'), false);
});

test('Programmatic SEO engine generates structured pages and chunks sitemaps into 1,000-URL files', () => {
  const totalCount = getTotalProgrammaticPageCount();
  assert.equal(totalCount >= 2000, true);

  const chunks = getSitemapChunks(1000);
  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].filename, '/sitemap_1.xml');
  assert.equal(chunks[0].entries.length, 1000);
  assert.equal(chunks[1].filename, '/sitemap_2.xml');
  assert.equal(chunks[1].entries.length, 1000);
  assert.equal(chunks[2].filename, '/sitemap_3.xml');
  assert.equal(chunks[2].entries.length > 500, true);

  // Verify dynamic combinatorial page resolution
  const dynamicPage = resolveDynamicPseoPage(
    'clinical-guides',
    'major-depressive-disorder-cbt-protocol-adults'
  );
  assert.ok(dynamicPage);
  assert.equal(dynamicPage?.dsmOrIcdCode.includes('[Diagnostic Code]'), true);
  assert.equal(dynamicPage?.epidemiologyAndMetrics.length, 3);
});

test('Repository layer supports tag archive lookup and full CRUD for authors, sections, and pSEO templates', async () => {
  const { publicationService } = await import('../services/publication-service');
  const tags = publicationService.getAllTags();
  assert.equal(tags.length > 0, true);

  const tagResult = publicationService.getArticlesByTag(tags[0].slug);
  assert.equal(tagResult.articles.length > 0, true);

  const reviewer = publicationService.getAuthorBySlug('reviewer-placeholder');
  assert.ok(reviewer);
  assert.equal(reviewer?.name, '[Reviewer Name]');

  const snapshot = publicationService.exportStateSnapshot();
  assert.equal(snapshot.articles.length > 0, true);
  assert.equal(snapshot.authors.length >= 2, true);
  assert.equal(snapshot.sections.length, 8);
  assert.equal(snapshot.corePseoPages.length > 0, true);

  const { validateAndSanitizeCmsSnapshot } = await import('./index');

  // 1. Valid snapshot with injected HTML/script tags gets sanitized cleanly
  const dirtySnapshot = {
    sections: [
      {
        slug: 'latest-news',
        name: '<script>alert(1)</script>Latest <b>News</b>',
        shortName: '<i>Latest</i>',
        description: 'Clinical <iframe src="evil"></iframe>dispatches onclick=bad()',
        leadNote: 'Desk Note',
      },
    ],
  };
  const sanitizedRes = validateAndSanitizeCmsSnapshot(dirtySnapshot);
  assert.equal(sanitizedRes.valid, true);
  assert.equal(sanitizedRes.sanitized?.sections?.[0].name, 'Latest News');
  assert.equal(sanitizedRes.sanitized?.sections?.[0].shortName, 'Latest');
  assert.equal(
    sanitizedRes.sanitized?.sections?.[0].description.includes('<iframe'),
    false
  );
  assert.equal(
    sanitizedRes.sanitized?.sections?.[0].description.includes('onclick='),
    false
  );

  // 2. Rejects unknown top-level keys (strict schema)
  const unknownKeyRes = validateAndSanitizeCmsSnapshot({
    sections: dirtySnapshot.sections,
    extraUnexpectedField: true,
  });
  assert.equal(unknownKeyRes.valid, false);
  assert.equal(unknownKeyRes.error?.includes('Strict schema violation'), true);

  // 3. Rejects invalid SectionSlug
  const badSlugRes = validateAndSanitizeCmsSnapshot({
    sections: [
      {
        slug: 'not-a-valid-section-slug',
        name: 'Invalid',
        shortName: 'Invalid',
        description: 'Invalid section',
      },
    ],
  });
  assert.equal(badSlugRes.valid, false);

  // 4. Rejects payload exceeding file size limit
  const oversizedRes = validateAndSanitizeCmsSnapshot(JSON.stringify(snapshot), 128);
  assert.equal(oversizedRes.valid, false);
  assert.equal(oversizedRes.error?.includes('exceeds maximum allowed size'), true);
});

test('Phase 6: Strict CSP header, magic-byte image verification, EXIF stripping, WebP re-encoding, and signed URLs', async () => {
  const {
    buildCspHeader,
    verifyImageMagicBytes,
    MAX_IMAGE_UPLOAD_BYTES,
    generateRandomWebpFilename,
    isValidUploadedImageFilename,
    signImageAssetToken,
    verifyImageAssetToken,
  } = await import('./index');
  const {
    sanitizeAndReencodeToWebp,
    storeSanitizedWebpUpload,
    readStoredWebpUpload,
  } = await import('./image-processor');
  const sharp = (await import('sharp')).default;

  // 1. Strict CSP header includes all required directives and cryptographic nonce
  const nonce = 'testNonce2026Base64==';
  const csp = buildCspHeader(nonce);
  assert.equal(csp.includes("default-src 'self'"), true);
  assert.equal(csp.includes("frame-ancestors 'none'"), true);
  assert.equal(csp.includes("object-src 'none'"), true);
  assert.equal(csp.includes("base-uri 'self'"), true);
  assert.equal(csp.includes("form-action 'self'"), true);
  assert.equal(csp.includes('upgrade-insecure-requests'), true);
  assert.equal(csp.includes(`'nonce-${nonce}'`), true);

  // 2. Magic-byte check rejects spoofed script/SVG/HTML disguised as an image
  const spoofedHtml = Buffer.from('<html><script>alert("xss")</script></html>', 'utf8');
  assert.equal(verifyImageMagicBytes(spoofedHtml).valid, false);

  const spoofedSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>', 'utf8');
  assert.equal(verifyImageMagicBytes(spoofedSvg).valid, false);

  // 3. Magic-byte check rejects oversized (> 5 MB) payload
  const oversizedBuffer = Buffer.alloc(MAX_IMAGE_UPLOAD_BYTES + 1, 0xff);
  assert.equal(verifyImageMagicBytes(oversizedBuffer).valid, false);

  // 4. Generate a genuine JPEG image with EXIF metadata using sharp, then sanitize & re-encode to WebP
  const jpegWithExif = await sharp({
    create: {
      width: 32,
      height: 24,
      channels: 3,
      background: { r: 30, g: 72, b: 184 },
    },
  })
    .withExif({
      IFD0: {
        Artist: 'SecretCameraAuthor',
        Software: 'HiddenCameraFirmware',
        Copyright: 'SensitiveExifTag',
      },
    })
    .jpeg()
    .toBuffer();

  // Confirm input has JPEG magic bytes and EXIF metadata
  const magicJpeg = verifyImageMagicBytes(jpegWithExif);
  assert.equal(magicJpeg.valid, true);
  assert.equal(magicJpeg.detectedFormat, 'jpeg');
  const inputMeta = await sharp(jpegWithExif).metadata();
  assert.ok(inputMeta.exif);

  // Run sanitizeAndReencodeToWebp: verifies magic bytes, strips EXIF, and re-encodes to WebP
  const sanitized = await sanitizeAndReencodeToWebp(jpegWithExif);
  assert.equal(sanitized.width, 32);
  assert.equal(sanitized.height, 24);
  assert.equal(sanitized.detectedFormat, 'jpeg');

  const webpMagic = verifyImageMagicBytes(sanitized.webpBuffer);
  assert.equal(webpMagic.valid, true);
  assert.equal(webpMagic.detectedFormat, 'webp');

  const outputMeta = await sharp(sanitized.webpBuffer).metadata();
  assert.equal(outputMeta.format, 'webp');
  assert.equal(outputMeta.exif, undefined);

  // 5. Store sanitized WebP under random filename in /.cms-uploads and verify signed URL
  const stored = await storeSanitizedWebpUpload(jpegWithExif);
  assert.equal(isValidUploadedImageFilename(stored.filename), true);
  assert.equal(isValidUploadedImageFilename('../etc/passwd'), false);
  assert.equal(stored.signedUrl.startsWith(`/api/media/${stored.filename}?sig=`), true);

  const token = signImageAssetToken(stored.filename);
  assert.equal(verifyImageAssetToken(stored.filename, token), true);
  assert.equal(verifyImageAssetToken(stored.filename, 'tampered_signature'), false);

  const diskBuffer = readStoredWebpUpload(stored.filename);
  assert.ok(diskBuffer);
  assert.equal(diskBuffer?.byteLength, stored.byteLength);

  // Clean up test upload file
  const fs = await import('fs');
  const path = await import('path');
  const testFilePath = path.join(process.cwd(), '.cms-uploads', stored.filename);
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }

  // Also check random filename format directly
  const randomName = generateRandomWebpFilename();
  assert.equal(isValidUploadedImageFilename(randomName), true);
});

test('Phase 7: Middleware bot classification, safe spoofed Googlebot handling, SEO/logo exemptions, and /assets/* hotlink protection', async () => {
  const {
    classifyBotTraffic,
    isAlwaysAllowedSeoOrLogoPath,
    isAssetRefererAllowed,
    recordPageRequestAndGetRpm,
    resetPageRateBucketsForTesting,
  } = await import('./index');

  // 1. Blocks known scraper user-agents (scrapy, python-requests, curl, bytespider, ccbot, etc.)
  for (const scraperUa of [
    'Scrapy/2.11.0 (+https://scrapy.org)',
    'python-requests/2.31.0',
    'curl/8.5.0',
    'Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)',
    'CCBot/2.0 (https://commoncrawl.org/faq/)',
    'GPTBot/1.0',
  ]) {
    assert.equal(
      classifyBotTraffic({ userAgent: scraperUa, requestsPerMinute: 1 }),
      'blocked_scraper',
      `Expected ${scraperUa} to be blocked`
    );
  }

  // 2. Never blocks real Googlebot, Bingbot, Applebot, or DuckDuckBot
  assert.equal(
    classifyBotTraffic({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      requestsPerMinute: 25,
      verifiedReverseDnsHost: 'crawl-66-249-66-1.googlebot.com',
    }),
    'verified_search_crawler'
  );
  assert.equal(
    classifyBotTraffic({
      userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      requestsPerMinute: 20,
      verifiedReverseDnsHost: 'msnbot-40-77-167-1.search.msn.com',
    }),
    'verified_search_crawler'
  );

  // 3. Safe handling of unverified vs rDNS-failed spoofed Googlebot:
  //    - When unverified in Edge middleware (no rDNS yet), normal rates are allowed ('verified_search_crawler')
  //      and aggressive floods (> 60 RPM) are rate-limited ('rate_limited_bot') instead of blocking real Googlebot.
  assert.equal(
    classifyBotTraffic({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      requestsPerMinute: 15,
    }),
    'verified_search_crawler'
  );
  assert.equal(
    classifyBotTraffic({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      requestsPerMinute: 75,
    }),
    'rate_limited_bot'
  );
  //    - When Node rDNS verification proves the hostname is NOT Google/Bing, it returns 'blocked_scraper'
  assert.equal(
    classifyBotTraffic({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      requestsPerMinute: 5,
      verifiedReverseDnsHost: 'spoofed-crawler.evil-domain.org',
    }),
    'blocked_scraper'
  );

  // 4. Never blocks sitemaps, robots.txt, RSS feed, or brand logo files
  for (const allowedPath of [
    '/robots.txt',
    '/rss.xml',
    '/sitemap.xml',
    '/sitemap_1.xml',
    '/sitemap_2.xml',
    '/sitemap_3.xml',
    '/news-sitemap.xml',
    '/logo-blue.png',
    '/logo-white.png',
    '/brain-icon.png',
  ]) {
    assert.equal(isAlwaysAllowedSeoOrLogoPath(allowedPath), true);
  }
  assert.equal(isAlwaysAllowedSeoOrLogoPath('/articles/some-slug'), false);

  // 5. /assets/* Referer hotlink protection allows empty Referer and own domain, blocks external sites
  assert.equal(
    isAssetRefererAllowed({ referer: null, requestHost: 'therapistpsychologisttoday.com' }),
    true
  );
  assert.equal(
    isAssetRefererAllowed({ referer: '', requestHost: 'therapistpsychologisttoday.com' }),
    true
  );
  assert.equal(
    isAssetRefererAllowed({
      referer: 'https://therapistpsychologisttoday.com/articles/lead',
      requestHost: 'therapistpsychologisttoday.com',
    }),
    true
  );
  assert.equal(
    isAssetRefererAllowed({
      referer: 'http://localhost:3000/',
      requestHost: 'localhost:3000',
    }),
    true
  );
  assert.equal(
    isAssetRefererAllowed({
      referer: 'https://external-hotlinker.example.org/stolen-image.html',
      requestHost: 'therapistpsychologisttoday.com',
    }),
    false
  );

  // 6. Sliding-window RPM rate limiter triggers rate_limited_bot when exceeding 90 requests/min in production
  resetPageRateBucketsForTesting();
  const baseNow = 1_700_000_000_000;
  let lastRpm = 0;
  for (let i = 0; i < 95; i++) {
    lastRpm = recordPageRequestAndGetRpm('198.51.100.77', baseNow + i * 100, '/articles/lead');
  }
  assert.equal(lastRpm, 95);
  assert.equal(
    classifyBotTraffic({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      requestsPerMinute: lastRpm,
    }),
    'rate_limited_bot'
  );
  resetPageRateBucketsForTesting();

  // 7. Static assets (/_next/*, images, HMR) are excluded from the rate limiter, and non-production uses higher limits
  const {
    getEffectiveRateLimits,
    isStaticOrHmrRequest,
    PREVIEW_READER_RPM_LIMIT,
    PRODUCTION_READER_RPM_LIMIT,
  } = await import('./index');
  const { buildCspHeader, isPreviewFramingAllowed } = await import('./csp');

  assert.equal(isStaticOrHmrRequest('/_next/static/chunks/main.js'), true);
  assert.equal(isStaticOrHmrRequest('/_next/webpack-hmr'), true);
  assert.equal(isStaticOrHmrRequest('/_next/image'), true);
  assert.equal(isStaticOrHmrRequest('/assets/photo.webp'), true);
  assert.equal(isStaticOrHmrRequest('/logo-blue.png'), true);
  assert.equal(isStaticOrHmrRequest('/articles/clinical-study'), false);

  resetPageRateBucketsForTesting();
  for (let i = 0; i < 200; i++) {
    recordPageRequestAndGetRpm('127.0.0.1', baseNow + i * 10, '/_next/static/chunks/app.js');
    recordPageRequestAndGetRpm('127.0.0.1', baseNow + i * 10, '/logo-blue.png');
  }
  // None of those static requests should have incremented the page bucket
  const firstPageRpm = recordPageRequestAndGetRpm('127.0.0.1', baseNow + 5000, '/');
  assert.equal(firstPageRpm, 1);
  resetPageRateBucketsForTesting();

  const prodLimits = getEffectiveRateLimits({ NODE_ENV: 'production' });
  const devLimits = getEffectiveRateLimits({ NODE_ENV: 'development' });
  assert.equal(prodLimits.maxReaderRpm, PRODUCTION_READER_RPM_LIMIT);
  assert.equal(devLimits.maxReaderRpm, PREVIEW_READER_RPM_LIMIT);
  assert.ok(devLimits.maxReaderRpm > prodLimits.maxReaderRpm);

  // 8. CSP frame-ancestors & preview framing rules:
  //    In production (without ALLOW_PREVIEW_FRAMING=true), framing is strictly blocked (`frame-ancestors 'none'`).
  //    In development or when ALLOW_PREVIEW_FRAMING=true, framing is allowed for the AI Studio preview iframe.
  assert.equal(isPreviewFramingAllowed({ NODE_ENV: 'production' }), false);
  assert.equal(
    isPreviewFramingAllowed({ NODE_ENV: 'production', ALLOW_PREVIEW_FRAMING: 'false' }),
    false
  );
  assert.equal(
    isPreviewFramingAllowed({ NODE_ENV: 'production', ALLOW_PREVIEW_FRAMING: 'true' }),
    true
  );
  assert.equal(isPreviewFramingAllowed({ NODE_ENV: 'development' }), true);

  const prodCsp = buildCspHeader('test-nonce', { allowPreviewFraming: false });
  assert.equal(prodCsp.includes("frame-ancestors 'none'"), true);
  assert.equal(prodCsp.includes('upgrade-insecure-requests'), true);

  const previewCsp = buildCspHeader('test-nonce', { allowPreviewFraming: true });
  assert.equal(previewCsp.includes("frame-ancestors 'none'"), false);
  assert.equal(previewCsp.includes("frame-ancestors 'self' https: http:"), true);
});

test('Phase 8: PostgresPublicationRepository parameterized queries, automatic switching, production fail-fast, SSL pool config, migrations, seed script, and secret redaction', async () => {
  const {
    JsonFilePublicationRepository,
    PostgresPublicationRepository,
    createPublicationRepository,
    findAdminUserForAuth,
    loadPersistentState,
  } = await import('../services/publication-service');
  const {
    assertProductionDatabaseUrl,
    buildPgPoolConfig,
    sanitizeDatabaseError,
  } = await import('../db/postgres-pool');
  const { runMigrations } = await import('../../scripts/db-migrate');
  const { seedDatabaseAndCreateFirstAdmin } = await import('../../scripts/db-seed');

  const generatedDbSecret = crypto.randomBytes(12).toString('hex');
  const generatedAdminPass = `adm-${crypto.randomBytes(12).toString('hex')}`;
  const generatedLocalDevPass = `dev-${crypto.randomBytes(12).toString('hex')}`;
  const generatedLocalDevHash = hashPassword(generatedLocalDevPass);
  const testDbUrl = `postgresql://tpt_app_user:${generatedDbSecret}@ep-clinical-123.us-east-2.aws.neon.tech:5432/tpt_db?sslmode=require`;

  // 1. In production (NODE_ENV=production), missing DATABASE_URL fails with a clear error
  assert.throws(
    () =>
      assertProductionDatabaseUrl({
        NODE_ENV: 'production',
        DATABASE_URL: '',
      }),
    /FATAL: DATABASE_URL is required when NODE_ENV=production/
  );
  assert.throws(
    () =>
      createPublicationRepository({
        NODE_ENV: 'production',
        DATABASE_URL: '   ',
      }),
    /FATAL: DATABASE_URL is required when NODE_ENV=production/
  );

  // 2. In development / AI Studio preview without DATABASE_URL, automatically selects JsonFilePublicationRepository
  const fallbackRepo = createPublicationRepository({
    NODE_ENV: 'development',
    DATABASE_URL: '',
  });
  assert.equal(fallbackRepo instanceof JsonFilePublicationRepository, true);

  // 3. When DATABASE_URL is set, automatically switches to PostgresPublicationRepository and uses parameterized queries only
  const recordedQueries: { text: string; values?: unknown[] }[] = [];
  const storedUsers: Record<string, any>[] = [];

  const mockPool = {
    async query(text: string, values?: unknown[]) {
      recordedQueries.push({ text, values });
      if (text.includes('FROM schema_migrations')) {
        return { rows: [], rowCount: 0 } as any;
      }
      if (text.includes('FROM admin_users') && values?.[0]) {
        const match = storedUsers.find(
          (u) => u.username.toLowerCase() === String(values[0]).toLowerCase()
        );
        return { rows: match ? [match] : [], rowCount: match ? 1 : 0 } as any;
      }
      if (text.includes('INSERT INTO admin_users') && values) {
        storedUsers.push({
          id: values[0],
          username: values[1],
          display_name: values[2],
          role: values[3],
          password_hash: values[4],
          totp_enabled: values[5],
          last_login_at: values[6],
        });
        return { rows: [], rowCount: 1 } as any;
      }
      return { rows: [], rowCount: 1 } as any;
    },
  };

  const pgRepo = createPublicationRepository(
    {
      NODE_ENV: 'production',
      DATABASE_URL: testDbUrl,
    },
    mockPool
  );
  assert.equal(pgRepo instanceof PostgresPublicationRepository, true);
  await (pgRepo as InstanceType<typeof PostgresPublicationRepository>).ensureHydrated();

  // Verify parameterized SQL queries ($1, $2, ...) on CRUD operations
  const sampleSection = pgRepo.getSections()[0];
  await (pgRepo as InstanceType<typeof PostgresPublicationRepository>).upsertSectionInDb({
    ...sampleSection,
    leadNote: "Parameterized '; DROP TABLE sections; --",
  });
  const lastSectionQuery = recordedQueries[recordedQueries.length - 1];
  assert.equal(lastSectionQuery.text.includes('VALUES ($1, $2, $3, $4, $5, NOW())'), true);
  assert.equal(lastSectionQuery.text.includes('DROP TABLE'), false);
  assert.equal(
    lastSectionQuery.values?.[4],
    "Parameterized '; DROP TABLE sections; --"
  );

  // 4. SSL connection & connection pool limits (sslmode=require for Neon/managed Postgres)
  const neonPoolConfig = buildPgPoolConfig(testDbUrl, {
    PG_POOL_MAX: '12',
    PG_POOL_MIN: '2',
    PG_IDLE_TIMEOUT_MS: '25000',
    PG_CONNECT_TIMEOUT_MS: '4000',
  });
  assert.ok(neonPoolConfig.ssl);
  assert.equal(neonPoolConfig.max, 12);
  assert.equal(neonPoolConfig.min, 2);
  assert.equal(neonPoolConfig.idleTimeoutMillis, 25000);
  assert.equal(neonPoolConfig.connectionTimeoutMillis, 4000);

  // 5. Migrations & Seed script with runtime password hashed via scrypt
  const migrationResult = await runMigrations(mockPool);
  assert.deepEqual(migrationResult.applied, [
    '0001_roles_and_least_privilege.sql',
    '0002_publication_schema.sql',
    '0003_grant_app_role_dml_only.sql',
  ]);

  const initialData = loadPersistentState();
  const seedResult = await seedDatabaseAndCreateFirstAdmin({
    pool: mockPool,
    seedData: initialData,
    adminUsername: 'clinical_admin',
    adminDisplayName: '[Chief Editor], [Credentials]',
    runtimeAdminPassword: generatedAdminPass,
  });

  assert.equal(seedResult.sectionsSeeded, initialData.sections.length);
  assert.equal(seedResult.authorsSeeded, initialData.authors.length);
  assert.equal(seedResult.articlesSeeded, initialData.articles.length);
  assert.equal(seedResult.pseoPagesSeeded, initialData.corePseoPages.length);
  assert.equal(seedResult.adminUsername, 'clinical_admin');

  const seededAdmin = await (
    pgRepo as InstanceType<typeof PostgresPublicationRepository>
  ).findAdminUserByUsernameInDb('clinical_admin');
  assert.ok(seededAdmin);
  assert.equal(seededAdmin.passwordHash.startsWith('$scrypt$n=16384,r=8,p=1$'), true);
  assert.equal(seededAdmin.passwordHash.includes(generatedAdminPass), false);
  assert.equal(verifyPassword(generatedAdminPass, seededAdmin.passwordHash), true);

  // 6. Production login authenticates ONLY against PostgreSQL and ignores ALLOW_DEMO_ADMIN=true
  const prodSeededMatch = await findAdminUserForAuth(
    'clinical_admin',
    {
      NODE_ENV: 'production',
      DATABASE_URL: testDbUrl,
      ALLOW_DEMO_ADMIN: 'true',
      ADMIN_USERNAME: 'demo_user',
      ADMIN_PASSWORD_HASH: generatedLocalDevHash,
    },
    mockPool
  );
  assert.ok(prodSeededMatch);
  assert.equal(prodSeededMatch?.username, 'clinical_admin');

  const prodDemoIgnored = await findAdminUserForAuth(
    'demo_user',
    {
      NODE_ENV: 'production',
      DATABASE_URL: testDbUrl,
      ALLOW_DEMO_ADMIN: 'true',
      ADMIN_USERNAME: 'demo_user',
      ADMIN_PASSWORD_HASH: generatedLocalDevHash,
    },
    mockPool
  );
  assert.equal(prodDemoIgnored, undefined);

  // 7. Local development without DATABASE_URL fails closed by default, and allows demo admin ONLY when ALLOW_DEMO_ADMIN=true
  const localDefaultClosed = await findAdminUserForAuth('admin', {
    NODE_ENV: 'development',
    DATABASE_URL: '',
  });
  assert.equal(localDefaultClosed, undefined);

  const localAllowedWhenExplicit = await findAdminUserForAuth('admin', {
    NODE_ENV: 'development',
    DATABASE_URL: '',
    ALLOW_DEMO_ADMIN: 'true',
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD_HASH: generatedLocalDevHash,
  });
  assert.ok(localAllowedWhenExplicit);
  assert.equal(verifyPassword(generatedLocalDevPass, localAllowedWhenExplicit.passwordHash), true);

  // 8. Never log DATABASE_URL, passwords, or full SQL parameters
  const paramToken = crypto.randomBytes(8).toString('hex');
  const rawError = new Error(
    `Connect failed to ${testDbUrl} password=${generatedDbSecret} params: ["${paramToken}"]`
  );
  const redacted = sanitizeDatabaseError(rawError);
  assert.equal(redacted.includes(generatedDbSecret), false);
  assert.equal(redacted.includes('postgresql://'), false);
  assert.equal(redacted.includes(paramToken), false);
  assert.equal(redacted.includes('[REDACTED_DATABASE_URL]'), true);
});
