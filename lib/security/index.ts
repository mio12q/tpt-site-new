import crypto from 'node:crypto';
import type {
  AdminRole,
  AdminUser,
  Article,
  AuditLogEntry,
  AuthorProfile,
  PseoCategory,
  PseoPage,
  SectionInfo,
  SectionSlug,
} from '../domain/types';

const DEFAULT_SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'tpt_editorial_production_fallback_hmac_secret_2026_key_9981726354';

// ---------------------------------------------------------------------------
// 1. Password Hashing & Verification (Scrypt / Argon2id compatible format)
//    Cost N=16384 (2^14), r=8, p=1, 64-byte output key + constant-time verify
// ---------------------------------------------------------------------------

export function hashPassword(plainPassword: string, saltHex?: string): string {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return `$scrypt$n=16384,r=8,p=1$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  try {
    if (!plainPassword || !storedHash) return false;
    const parts = storedHash.split('$').filter(Boolean);
    if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
    const saltHex = parts[2];
    const expectedKeyHex = parts[3];
    const salt = Buffer.from(saltHex, 'hex');
    const expectedKey = Buffer.from(expectedKeyHex, 'hex');
    const derivedKey = crypto.scryptSync(plainPassword, salt, expectedKey.length, {
      N: 16384,
      r: 8,
      p: 1,
    });
    if (derivedKey.length !== expectedKey.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 2. Login Rate Limiting & Temporary Lockout
// ---------------------------------------------------------------------------

interface RateLimitBucket {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number | null;
}

const loginBuckets = new Map<string, RateLimitBucket>();
const endpointBuckets = new Map<string, { count: number; windowStart: number }>();

const MAX_LOGIN_FAILURES = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const FAILURE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export function checkLoginRateLimit(
  key: string,
  nowMs: number = Date.now()
): { allowed: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const bucket = loginBuckets.get(key);
  if (!bucket) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_FAILURES, lockedUntil: null };
  }
  if (bucket.lockedUntil && nowMs < bucket.lockedUntil) {
    return { allowed: false, remainingAttempts: 0, lockedUntil: bucket.lockedUntil };
  }
  if (bucket.lockedUntil && nowMs >= bucket.lockedUntil) {
    loginBuckets.delete(key);
    return { allowed: true, remainingAttempts: MAX_LOGIN_FAILURES, lockedUntil: null };
  }
  if (nowMs - bucket.firstFailureAt > FAILURE_WINDOW_MS) {
    loginBuckets.delete(key);
    return { allowed: true, remainingAttempts: MAX_LOGIN_FAILURES, lockedUntil: null };
  }
  return {
    allowed: bucket.failures < MAX_LOGIN_FAILURES,
    remainingAttempts: Math.max(0, MAX_LOGIN_FAILURES - bucket.failures),
    lockedUntil: bucket.lockedUntil,
  };
}

export function recordLoginFailure(
  key: string,
  nowMs: number = Date.now()
): { lockedOut: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const current = loginBuckets.get(key);
  if (!current || nowMs - current.firstFailureAt > FAILURE_WINDOW_MS) {
    const next: RateLimitBucket = {
      failures: 1,
      firstFailureAt: nowMs,
      lockedUntil: null,
    };
    loginBuckets.set(key, next);
    return {
      lockedOut: false,
      remainingAttempts: MAX_LOGIN_FAILURES - 1,
      lockedUntil: null,
    };
  }
  current.failures += 1;
  if (current.failures >= MAX_LOGIN_FAILURES) {
    current.lockedUntil = nowMs + LOCKOUT_DURATION_MS;
    loginBuckets.set(key, current);
    return {
      lockedOut: true,
      remainingAttempts: 0,
      lockedUntil: current.lockedUntil,
    };
  }
  loginBuckets.set(key, current);
  return {
    lockedOut: false,
    remainingAttempts: MAX_LOGIN_FAILURES - current.failures,
    lockedUntil: null,
  };
}

export function clearLoginFailures(key: string): void {
  loginBuckets.delete(key);
}

export function checkEndpointRateLimit(
  endpointKey: string,
  maxRequests: number,
  windowMs: number,
  nowMs: number = Date.now()
): { allowed: boolean; remaining: number } {
  const record = endpointBuckets.get(endpointKey);
  if (!record || nowMs - record.windowStart >= windowMs) {
    endpointBuckets.set(endpointKey, { count: 1, windowStart: nowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  record.count += 1;
  endpointBuckets.set(endpointKey, record);
  return { allowed: true, remaining: maxRequests - record.count };
}

// ---------------------------------------------------------------------------
// 3. Optional TOTP Two-Factor Verification & IP Allowlist
// ---------------------------------------------------------------------------

export function generateTotpCode(secret: string, timeStep: number = Math.floor(Date.now() / 30000)): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(timeStep), 0);
  const hmac = crypto.createHmac('sha1', secret).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 1000000).padStart(6, '0');
}

export function verifyTotpCode(inputCode: string, secret: string, nowMs: number = Date.now()): boolean {
  if (!secret || !/^\d{6}$/.test(inputCode)) return false;
  const currentStep = Math.floor(nowMs / 30000);
  for (const offset of [-1, 0, 1]) {
    const expected = generateTotpCode(secret, currentStep + offset);
    if (expected === inputCode) return true;
  }
  return false;
}

export function extractClientIp(options: {
  headers?: { get(name: string): string | null | undefined };
  directIp?: string | null;
  trustCloudflare?: boolean;
}): string {
  const trustCf =
    options.trustCloudflare ?? process.env.TRUST_CLOUDFLARE === 'true';
  if (trustCf && options.headers) {
    const cfIp = options.headers.get('cf-connecting-ip')?.trim();
    if (cfIp) {
      return cfIp;
    }
  }
  const direct = (options.directIp || '').trim();
  return direct || '127.0.0.1';
}

export function verifyIpAllowlist(clientIp: string, allowlistCsv?: string): boolean {
  const raw = allowlistCsv ?? process.env.ADMIN_IP_ALLOWLIST ?? '';
  if (!raw.trim()) return true; // Only enforce when ADMIN_IP_ALLOWLIST is set
  const allowedIps = raw
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
  return allowedIps.includes((clientIp || '').trim());
}

// ---------------------------------------------------------------------------
// 4. Server-Side Sessions, Sliding Idle Timeout (30m), Absolute Max (8h) & CSRF
// ---------------------------------------------------------------------------

export interface SessionRecord {
  sessionId: string;
  userId: string;
  username: string;
  displayName: string;
  role: AdminRole;
  csrfToken: string;
  createdAt: number;
  lastActivityAt: number;
  idleExpiresAt: number;
  expiresAt: number; // Absolute maximum lifetime (createdAt + 8 hours)
}

const activeSessions = new Map<string, SessionRecord>();
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
export const SESSION_ABSOLUTE_MAX_MS = 8 * 60 * 60 * 1000; // 8 hours absolute maximum lifetime

export function createSession(
  user: Pick<AdminUser, 'id' | 'username' | 'displayName' | 'role'>,
  nowMs: number = Date.now()
): { signedCookieValue: string; session: SessionRecord } {
  const sessionId = crypto.randomBytes(24).toString('hex');
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const session: SessionRecord = {
    sessionId,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    csrfToken,
    createdAt: nowMs,
    lastActivityAt: nowMs,
    idleExpiresAt: nowMs + SESSION_IDLE_TIMEOUT_MS,
    expiresAt: nowMs + SESSION_ABSOLUTE_MAX_MS,
  };
  activeSessions.set(sessionId, session);
  const signature = crypto
    .createHmac('sha256', DEFAULT_SESSION_SECRET)
    .update(sessionId)
    .digest('hex');
  return {
    signedCookieValue: `${sessionId}.${signature}`,
    session,
  };
}

export function verifySessionCookie(
  signedCookieValue: string | undefined,
  nowMs: number = Date.now()
): SessionRecord | null {
  if (!signedCookieValue) return null;
  const parts = signedCookieValue.split('.');
  if (parts.length !== 2) return null;
  const [sessionId, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', DEFAULT_SESSION_SECRET)
    .update(sessionId)
    .digest('hex');
  try {
    const a = Buffer.from(providedSig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
  } catch {
    return null;
  }
  const session = activeSessions.get(sessionId);
  if (!session) return null;

  // 1. Enforce 8-hour absolute maximum session lifetime
  if (nowMs - session.createdAt > SESSION_ABSOLUTE_MAX_MS || nowMs > session.expiresAt) {
    activeSessions.delete(sessionId);
    return null;
  }

  // 2. Enforce 30-minute sliding idle timeout since lastActivityAt
  if (nowMs - session.lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
    activeSessions.delete(sessionId);
    return null;
  }

  // 3. Slide idle window forward on valid activity (capped by 8h absolute max)
  session.lastActivityAt = nowMs;
  session.idleExpiresAt = Math.min(session.expiresAt, nowMs + SESSION_IDLE_TIMEOUT_MS);
  activeSessions.set(sessionId, session);
  return session;
}

export function invalidateSession(signedCookieValue: string | undefined): void {
  if (!signedCookieValue) return;
  const [sessionId] = signedCookieValue.split('.');
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
}

export function verifyCsrfToken(session: SessionRecord | null, providedCsrf: string | undefined): boolean {
  if (!session || !providedCsrf) return false;
  try {
    const a = Buffer.from(session.csrfToken, 'utf8');
    const b = Buffer.from(providedCsrf, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 5. Role-Based Access Control (RBAC) & Audit Logging
// ---------------------------------------------------------------------------

export type AdminPermission =
  | 'articles:create'
  | 'articles:edit'
  | 'articles:delete'
  | 'pseo:manage'
  | 'users:manage'
  | 'security:audit';

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  admin: [
    'articles:create',
    'articles:edit',
    'articles:delete',
    'pseo:manage',
    'users:manage',
    'security:audit',
  ],
  editor: ['articles:create', 'articles:edit', 'pseo:manage'],
  author: ['articles:create', 'articles:edit'],
};

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

const auditLogs: AuditLogEntry[] = [];

export function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const record: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(record);
  if (auditLogs.length > 200) {
    auditLogs.pop();
  }
  return record;
}

export function getAuditLogs(): AuditLogEntry[] {
  return [...auditLogs];
}

// ---------------------------------------------------------------------------
// 6. Server-Side Input Validation & XSS Sanitization
// ---------------------------------------------------------------------------

export function sanitizePlainText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

export function escapeHtmlEntities(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function validateNewsletterSubmission(payload: {
  email?: string;
  honeypot?: string;
  frequency?: string;
}): { valid: boolean; sanitizedEmail?: string; error?: string; isBot?: boolean } {
  // Honeypot check: if hidden field is filled, silently reject bot
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    return { valid: false, isBot: true, error: 'Submission rejected.' };
  }
  const email = (payload.email || '').trim().toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/;
  if (!email || email.length > 160 || !emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid clinical or personal email address.' };
  }
  return { valid: true, sanitizedEmail: email };
}

// ---------------------------------------------------------------------------
// 6B. Strict CMS JSON Snapshot Schema Validation, HTML Sanitization & Size Limit
// ---------------------------------------------------------------------------

export const MAX_SNAPSHOT_BYTES = 512 * 1024; // 512 KB strict file size limit

const VALID_SECTION_SLUGS = new Set<SectionSlug>([
  'latest-news',
  'mental-health',
  'research-studies',
  'public-health',
  'conditions',
  'treatments',
  'wellness',
  'opinion',
]);

const VALID_PSEO_CATEGORIES = new Set<PseoCategory>([
  'topic-hub',
  'condition',
  'treatment',
  'study-explainer',
  'glossary',
  'faq',
]);

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isSafeUrlOrPath(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:')
  ) {
    return false;
  }
  return (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    trimmed.startsWith('/')
  );
}

function hasForbiddenKeys(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) {
    return value.some(hasForbiddenKeys);
  }
  for (const key of Object.keys(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }
    if (hasForbiddenKeys((value as Record<string, unknown>)[key])) {
      return true;
    }
  }
  return false;
}

export interface ValidatedCmsSnapshot {
  articles?: Article[];
  authors?: AuthorProfile[];
  sections?: SectionInfo[];
  corePseoPages?: PseoPage[];
}

export function validateAndSanitizeCmsSnapshot(
  rawInput: unknown,
  maxBytes: number = MAX_SNAPSHOT_BYTES
): {
  valid: boolean;
  error?: string;
  sanitized?: ValidatedCmsSnapshot;
} {
  let parsed: unknown = rawInput;

  if (typeof rawInput === 'string') {
    const byteLen = Buffer.byteLength(rawInput, 'utf8');
    if (byteLen > maxBytes) {
      return {
        valid: false,
        error: `JSON snapshot exceeds maximum allowed size of ${Math.round(maxBytes / 1024)} KB.`,
      };
    }
    try {
      parsed = JSON.parse(rawInput);
    } catch {
      return { valid: false, error: 'Malformed JSON syntax.' };
    }
  } else {
    const serialized = JSON.stringify(rawInput ?? '');
    const byteLen = Buffer.byteLength(serialized, 'utf8');
    if (byteLen > maxBytes) {
      return {
        valid: false,
        error: `JSON snapshot exceeds maximum allowed size of ${Math.round(maxBytes / 1024)} KB.`,
      };
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'Snapshot root must be a JSON object.' };
  }

  if (hasForbiddenKeys(parsed)) {
    return { valid: false, error: 'Snapshot rejected: contains forbidden prototype keys.' };
  }

  const record = parsed as Record<string, unknown>;
  const allowedTopKeys = new Set(['articles', 'authors', 'sections', 'corePseoPages']);
  const keys = Object.keys(record);

  if (keys.length === 0) {
    return { valid: false, error: 'Snapshot object cannot be empty.' };
  }

  for (const key of keys) {
    if (!allowedTopKeys.has(key)) {
      return {
        valid: false,
        error: `Strict schema violation: unknown top-level property "${sanitizePlainText(key, 40)}". Allowed properties: articles, authors, sections, corePseoPages.`,
      };
    }
  }

  const sanitized: ValidatedCmsSnapshot = {};

  // 1. Validate & sanitize sections if present
  if (record.sections !== undefined) {
    if (!Array.isArray(record.sections) || record.sections.length === 0 || record.sections.length > 20) {
      return {
        valid: false,
        error: 'Schema violation: "sections" must be a non-empty array (max 20 items).',
      };
    }
    const cleanSections: SectionInfo[] = [];
    for (let i = 0; i < record.sections.length; i++) {
      const item = record.sections[i];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { valid: false, error: `Schema violation: sections[${i}] must be an object.` };
      }
      const s = item as Record<string, unknown>;
      const slug = sanitizePlainText(String(s.slug ?? ''), 60) as SectionSlug;
      const name = sanitizePlainText(String(s.name ?? ''), 80);
      const shortName = sanitizePlainText(String(s.shortName ?? ''), 40);
      const description = sanitizePlainText(String(s.description ?? ''), 400);
      const leadNote = sanitizePlainText(String(s.leadNote ?? ''), 140);

      if (!VALID_SECTION_SLUGS.has(slug)) {
        return {
          valid: false,
          error: `Schema violation: sections[${i}].slug "${slug}" is not a valid SectionSlug.`,
        };
      }
      if (!name || !shortName || !description) {
        return {
          valid: false,
          error: `Schema violation: sections[${i}] requires non-empty name, shortName, and description.`,
        };
      }
      cleanSections.push({
        slug,
        name,
        shortName,
        description,
        leadNote: leadNote || `${name} Desk`,
      });
    }
    sanitized.sections = cleanSections;
  }

  // 2. Validate & sanitize authors if present
  if (record.authors !== undefined) {
    if (!Array.isArray(record.authors) || record.authors.length === 0 || record.authors.length > 100) {
      return {
        valid: false,
        error: 'Schema violation: "authors" must be a non-empty array (max 100 items).',
      };
    }
    const cleanAuthors: AuthorProfile[] = [];
    for (let i = 0; i < record.authors.length; i++) {
      const item = record.authors[i];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { valid: false, error: `Schema violation: authors[${i}] must be an object.` };
      }
      const a = item as Record<string, unknown>;
      const slug = sanitizePlainText(String(a.slug ?? ''), 80);
      const name = sanitizePlainText(String(a.name ?? ''), 120);
      const credentials = sanitizePlainText(String(a.credentials ?? ''), 80);
      const role = sanitizePlainText(String(a.role ?? ''), 120);
      const institution = sanitizePlainText(String(a.institution ?? ''), 160);
      const bio = sanitizePlainText(String(a.bio ?? ''), 2000);
      const orcid = sanitizePlainText(String(a.orcid ?? '[0000-0000-0000-0000]'), 40);
      const conflictOfInterestDisclosure = sanitizePlainText(
        String(a.conflictOfInterestDisclosure ?? '[Conflict of Interest Disclosure Placeholder]'),
        600
      );

      if (!slug || !SLUG_REGEX.test(slug) || slug.length > 80) {
        return {
          valid: false,
          error: `Schema violation: authors[${i}].slug must be a valid lowercase hyphenated slug.`,
        };
      }
      if (!name || !credentials || !role || !institution || !bio) {
        return {
          valid: false,
          error: `Schema violation: authors[${i}] requires name, credentials, role, institution, and bio.`,
        };
      }
      if (typeof a.isMedicalReviewer !== 'boolean') {
        return {
          valid: false,
          error: `Schema violation: authors[${i}].isMedicalReviewer must be a boolean.`,
        };
      }
      if (!Array.isArray(a.education) || !Array.isArray(a.clinicalSpecialties)) {
        return {
          valid: false,
          error: `Schema violation: authors[${i}] requires education and clinicalSpecialties string arrays.`,
        };
      }

      cleanAuthors.push({
        slug,
        name,
        credentials,
        role,
        institution,
        bio,
        education: a.education
          .slice(0, 20)
          .map((e) => sanitizePlainText(String(e ?? ''), 200))
          .filter(Boolean),
        clinicalSpecialties: a.clinicalSpecialties
          .slice(0, 20)
          .map((s) => sanitizePlainText(String(s ?? ''), 140))
          .filter(Boolean),
        peerReviewedPublications:
          typeof a.peerReviewedPublications === 'number' &&
          Number.isFinite(a.peerReviewedPublications) &&
          a.peerReviewedPublications >= 0
            ? Math.floor(a.peerReviewedPublications)
            : 0,
        conflictOfInterestDisclosure,
        isMedicalReviewer: a.isMedicalReviewer,
        orcid,
      });
    }
    sanitized.authors = cleanAuthors;
  }

  // 3. Validate & sanitize articles if present
  if (record.articles !== undefined) {
    if (!Array.isArray(record.articles) || record.articles.length === 0 || record.articles.length > 200) {
      return {
        valid: false,
        error: 'Schema violation: "articles" must be a non-empty array (max 200 items).',
      };
    }
    const cleanArticles: Article[] = [];
    for (let i = 0; i < record.articles.length; i++) {
      const item = record.articles[i];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { valid: false, error: `Schema violation: articles[${i}] must be an object.` };
      }
      const art = item as Record<string, unknown>;
      const slug = sanitizePlainText(String(art.slug ?? ''), 140);
      const title = sanitizePlainText(String(art.title ?? ''), 260);
      const subtitle = sanitizePlainText(String(art.subtitle ?? ''), 500);
      const excerpt = sanitizePlainText(String(art.excerpt ?? subtitle), 500);
      const section = sanitizePlainText(String(art.section ?? ''), 60) as SectionSlug;
      const authorSlug = sanitizePlainText(String(art.authorSlug ?? ''), 80);
      const reviewerSlug = sanitizePlainText(String(art.reviewerSlug ?? ''), 80);
      const locationDateline = sanitizePlainText(String(art.locationDateline ?? '[DATELINE]'), 80);
      const publishedAt = sanitizePlainText(String(art.publishedAt ?? ''), 40);
      const updatedAt = sanitizePlainText(String(art.updatedAt ?? publishedAt), 40);
      const lastReviewedAt = sanitizePlainText(String(art.lastReviewedAt ?? updatedAt), 40);

      if (!slug || !SLUG_REGEX.test(slug)) {
        return {
          valid: false,
          error: `Schema violation: articles[${i}].slug must be a valid lowercase hyphenated slug.`,
        };
      }
      if (!title || !subtitle) {
        return {
          valid: false,
          error: `Schema violation: articles[${i}] requires non-empty title and subtitle.`,
        };
      }
      if (!VALID_SECTION_SLUGS.has(section)) {
        return {
          valid: false,
          error: `Schema violation: articles[${i}].section "${section}" is not a valid SectionSlug.`,
        };
      }
      if (!authorSlug || !SLUG_REGEX.test(authorSlug) || !reviewerSlug || !SLUG_REGEX.test(reviewerSlug)) {
        return {
          valid: false,
          error: `Schema violation: articles[${i}] requires valid authorSlug and reviewerSlug.`,
        };
      }
      if (!Array.isArray(art.body) || art.body.length === 0) {
        return {
          valid: false,
          error: `Schema violation: articles[${i}].body must be a non-empty array of section blocks.`,
        };
      }
      if (!Array.isArray(art.primarySources) || art.primarySources.length === 0) {
        return {
          valid: false,
          error: `Schema violation: articles[${i}].primarySources must be a non-empty array.`,
        };
      }

      const cleanBody = [];
      for (let bIdx = 0; bIdx < art.body.length; bIdx++) {
        const blk = art.body[bIdx] as Record<string, unknown>;
        if (!blk || typeof blk !== 'object' || !Array.isArray(blk.paragraphs) || blk.paragraphs.length === 0) {
          return {
            valid: false,
            error: `Schema violation: articles[${i}].body[${bIdx}] must contain a non-empty paragraphs array.`,
          };
        }
        const cleanParagraphs = blk.paragraphs
          .slice(0, 30)
          .map((p) => sanitizePlainText(String(p ?? ''), 2500))
          .filter(Boolean);
        if (cleanParagraphs.length === 0) {
          return {
            valid: false,
            error: `Schema violation: articles[${i}].body[${bIdx}].paragraphs cannot be empty after HTML sanitization.`,
          };
        }
        let cleanCallout: { title: string; items: string[] } | undefined;
        if (blk.callout && typeof blk.callout === 'object' && !Array.isArray(blk.callout)) {
          const co = blk.callout as Record<string, unknown>;
          const coTitle = sanitizePlainText(String(co.title ?? ''), 180);
          const coItems = Array.isArray(co.items)
            ? co.items
                .slice(0, 12)
                .map((it) => sanitizePlainText(String(it ?? ''), 400))
                .filter(Boolean)
            : [];
          if (coTitle && coItems.length > 0) {
            cleanCallout = { title: coTitle, items: coItems };
          }
        }
        cleanBody.push({
          heading: blk.heading ? sanitizePlainText(String(blk.heading), 180) : undefined,
          paragraphs: cleanParagraphs,
          callout: cleanCallout,
        });
      }

      const cleanSources = [];
      for (let sIdx = 0; sIdx < art.primarySources.length; sIdx++) {
        const src = art.primarySources[sIdx] as Record<string, unknown>;
        if (!src || typeof src !== 'object') {
          return {
            valid: false,
            error: `Schema violation: articles[${i}].primarySources[${sIdx}] must be an object.`,
          };
        }
        const srcTitle = sanitizePlainText(String(src.title ?? ''), 240);
        const srcJournal = sanitizePlainText(String(src.journalOrInstitution ?? ''), 160);
        const srcDoi = sanitizePlainText(String(src.doiOrUrl ?? ''), 260);
        if (!srcTitle || !srcJournal || !srcDoi || !isSafeUrlOrPath(srcDoi)) {
          return {
            valid: false,
            error: `Schema violation: articles[${i}].primarySources[${sIdx}] requires title, journalOrInstitution, and a safe https:// or / doiOrUrl.`,
          };
        }
        cleanSources.push({
          id: sanitizePlainText(String(src.id ?? `src-${i}-${sIdx}`), 60),
          title: srcTitle,
          journalOrInstitution: srcJournal,
          publicationDate: sanitizePlainText(String(src.publicationDate ?? '[Publication Date]'), 60),
          doiOrUrl: srcDoi,
          studyDesign: sanitizePlainText(String(src.studyDesign ?? '[Study Design Placeholder]'), 140),
          sampleSize: src.sampleSize ? sanitizePlainText(String(src.sampleSize), 100) : undefined,
        });
      }

      const rawPq =
        art.pullQuote && typeof art.pullQuote === 'object'
          ? (art.pullQuote as Record<string, unknown>)
          : {};
      const rawFig =
        art.figure && typeof art.figure === 'object'
          ? (art.figure as Record<string, unknown>)
          : {};

      cleanArticles.push({
        slug,
        title,
        subtitle,
        excerpt,
        section,
        authorSlug,
        reviewerSlug,
        publishedAt: publishedAt || new Date().toISOString(),
        updatedAt: updatedAt || new Date().toISOString(),
        lastReviewedAt: lastReviewedAt || new Date().toISOString(),
        readingTimeMinutes:
          typeof art.readingTimeMinutes === 'number' && art.readingTimeMinutes > 0
            ? Math.min(60, Math.floor(art.readingTimeMinutes))
            : 6,
        isBreaking: Boolean(art.isBreaking),
        isFeaturedLead: Boolean(art.isFeaturedLead),
        isSecondaryLead: Boolean(art.isSecondaryLead),
        isOpinion: Boolean(art.isOpinion),
        mostReadRank:
          typeof art.mostReadRank === 'number' && art.mostReadRank > 0
            ? Math.floor(art.mostReadRank)
            : undefined,
        locationDateline,
        pullQuote: {
          quote: sanitizePlainText(String(rawPq.quote ?? subtitle), 400),
          attribution: sanitizePlainText(
            String(rawPq.attribution ?? '[Quote Attribution Placeholder]'),
            160
          ),
        },
        keyTakeaways: Array.isArray(art.keyTakeaways)
          ? art.keyTakeaways
              .slice(0, 10)
              .map((k) => sanitizePlainText(String(k ?? ''), 300))
              .filter(Boolean)
          : [],
        body: cleanBody,
        figure: {
          id: sanitizePlainText(String(rawFig.id ?? `fig-${slug}`), 60),
          type: 'clinical-trial-chart',
          title: sanitizePlainText(String(rawFig.title ?? '[Figure Title Placeholder]'), 200),
          subtitle: sanitizePlainText(
            String(rawFig.subtitle ?? '[Figure Subtitle Placeholder]'),
            240
          ),
          caption: sanitizePlainText(String(rawFig.caption ?? '[Figure Caption Placeholder]'), 300),
          credit: sanitizePlainText(String(rawFig.credit ?? '[Source Credit Placeholder]'), 160),
          dataPoints: Array.isArray(rawFig.dataPoints)
            ? rawFig.dataPoints.slice(0, 10).map((dp: unknown) => {
                const d = (dp && typeof dp === 'object' ? dp : {}) as Record<string, unknown>;
                return {
                  label: sanitizePlainText(String(d.label ?? '[Group]'), 100),
                  value: typeof d.value === 'number' && Number.isFinite(d.value) ? d.value : 50,
                  secondaryValue:
                    typeof d.secondaryValue === 'number' && Number.isFinite(d.secondaryValue)
                      ? d.secondaryValue
                      : undefined,
                  unit: sanitizePlainText(String(d.unit ?? '[Unit]'), 40),
                  note: d.note ? sanitizePlainText(String(d.note), 120) : undefined,
                };
              })
            : [],
        },
        primarySources: cleanSources,
        tags: Array.isArray(art.tags)
          ? art.tags
              .slice(0, 20)
              .map((t) => sanitizePlainText(String(t ?? ''), 60))
              .filter(Boolean)
          : [],
        relatedArticleSlugs: Array.isArray(art.relatedArticleSlugs)
          ? art.relatedArticleSlugs
              .slice(0, 10)
              .map((r) => sanitizePlainText(String(r ?? ''), 140))
              .filter(Boolean)
          : [],
        relatedPseoSlugs: Array.isArray(art.relatedPseoSlugs)
          ? art.relatedPseoSlugs
              .slice(0, 10)
              .map((r) => sanitizePlainText(String(r ?? ''), 140))
              .filter(Boolean)
          : [],
      });
    }
    sanitized.articles = cleanArticles;
  }

  // 4. Validate & sanitize corePseoPages if present
  if (record.corePseoPages !== undefined) {
    if (
      !Array.isArray(record.corePseoPages) ||
      record.corePseoPages.length === 0 ||
      record.corePseoPages.length > 200
    ) {
      return {
        valid: false,
        error: 'Schema violation: "corePseoPages" must be a non-empty array (max 200 items).',
      };
    }
    const cleanPseo: PseoPage[] = [];
    for (let i = 0; i < record.corePseoPages.length; i++) {
      const item = record.corePseoPages[i];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return {
          valid: false,
          error: `Schema violation: corePseoPages[${i}] must be an object.`,
        };
      }
      const p = item as Record<string, unknown>;
      const slug = sanitizePlainText(String(p.slug ?? ''), 120);
      const category = sanitizePlainText(String(p.category ?? ''), 40) as PseoCategory;
      const title = sanitizePlainText(String(p.title ?? ''), 220);
      const subtitle = sanitizePlainText(String(p.subtitle ?? ''), 400);
      const urlPath = sanitizePlainText(String(p.urlPath ?? ''), 180);
      const canonicalUrl = sanitizePlainText(String(p.canonicalUrl ?? ''), 240);
      const clinicalSummary = sanitizePlainText(String(p.clinicalSummary ?? ''), 2500);
      const neurobiologicalMechanism = sanitizePlainText(
        String(p.neurobiologicalMechanism ?? ''),
        2500
      );

      if (!slug || !SLUG_REGEX.test(slug)) {
        return {
          valid: false,
          error: `Schema violation: corePseoPages[${i}].slug must be a valid lowercase hyphenated slug.`,
        };
      }
      if (!VALID_PSEO_CATEGORIES.has(category)) {
        return {
          valid: false,
          error: `Schema violation: corePseoPages[${i}].category "${category}" is not a valid PseoCategory.`,
        };
      }
      if (!title || !subtitle || !clinicalSummary) {
        return {
          valid: false,
          error: `Schema violation: corePseoPages[${i}] requires title, subtitle, and clinicalSummary.`,
        };
      }
      if (urlPath && !isSafeUrlOrPath(urlPath)) {
        return {
          valid: false,
          error: `Schema violation: corePseoPages[${i}].urlPath is not a safe path.`,
        };
      }

      cleanPseo.push({
        slug,
        category,
        urlPath: urlPath || `/conditions/${slug}`,
        title,
        subtitle,
        metaTitle: sanitizePlainText(String(p.metaTitle ?? title), 220),
        metaDescription: sanitizePlainText(String(p.metaDescription ?? subtitle), 320),
        canonicalUrl:
          canonicalUrl && isSafeUrlOrPath(canonicalUrl)
            ? canonicalUrl
            : `https://therapistpsychologisttoday.com/conditions/${slug}`,
        dsmOrIcdCode: p.dsmOrIcdCode
          ? sanitizePlainText(String(p.dsmOrIcdCode), 100)
          : undefined,
        evidenceGrade: p.evidenceGrade
          ? sanitizePlainText(String(p.evidenceGrade), 100)
          : undefined,
        lastReviewedAt: sanitizePlainText(
          String(p.lastReviewedAt ?? new Date().toISOString()),
          40
        ),
        updatedAt: sanitizePlainText(String(p.updatedAt ?? new Date().toISOString()), 40),
        reviewerSlug: sanitizePlainText(String(p.reviewerSlug ?? 'reviewer-placeholder'), 80),
        authorSlug: sanitizePlainText(String(p.authorSlug ?? 'author-placeholder'), 80),
        clinicalSummary,
        neurobiologicalMechanism,
        diagnosticOrClinicalCriteria: Array.isArray(p.diagnosticOrClinicalCriteria)
          ? p.diagnosticOrClinicalCriteria
              .slice(0, 15)
              .map((c) => sanitizePlainText(String(c ?? ''), 300))
              .filter(Boolean)
          : [],
        epidemiologyAndMetrics: Array.isArray(p.epidemiologyAndMetrics)
          ? p.epidemiologyAndMetrics.slice(0, 12).map((m: unknown) => {
              const row = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>;
              return {
                metric: sanitizePlainText(String(row.metric ?? '[Metric]'), 120),
                value: sanitizePlainText(String(row.value ?? '[Value]'), 120),
                clinicalReference: sanitizePlainText(
                  String(row.clinicalReference ?? '[Reference]'),
                  180
                ),
                confidenceInterval: row.confidenceInterval
                  ? sanitizePlainText(String(row.confidenceInterval), 80)
                  : undefined,
              };
            })
          : [],
        treatmentOrClinicalProtocols: Array.isArray(p.treatmentOrClinicalProtocols)
          ? p.treatmentOrClinicalProtocols.slice(0, 10).map((tp: unknown) => {
              const pr = (tp && typeof tp === 'object' ? tp : {}) as Record<string, unknown>;
              return {
                name: sanitizePlainText(String(pr.name ?? '[Protocol]'), 140),
                efficacySummary: sanitizePlainText(String(pr.efficacySummary ?? ''), 400),
                durationOrDosage: sanitizePlainText(String(pr.durationOrDosage ?? ''), 140),
                guidelineSource: sanitizePlainText(String(pr.guidelineSource ?? ''), 160),
              };
            })
          : [],
        faqs: Array.isArray(p.faqs)
          ? p.faqs.slice(0, 15).map((f: unknown) => {
              const fq = (f && typeof f === 'object' ? f : {}) as Record<string, unknown>;
              return {
                question: sanitizePlainText(String(fq.question ?? ''), 240),
                answer: sanitizePlainText(String(fq.answer ?? ''), 1000),
              };
            })
          : [],
        primarySources: Array.isArray(p.primarySources)
          ? p.primarySources.slice(0, 10).map((s: unknown, sIdx: number) => {
              const sr = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
              const rawDoi = sanitizePlainText(String(sr.doiOrUrl ?? ''), 240);
              return {
                id: sanitizePlainText(String(sr.id ?? `pseo-src-${i}-${sIdx}`), 60),
                title: sanitizePlainText(String(sr.title ?? '[Study Title Placeholder]'), 240),
                journalOrInstitution: sanitizePlainText(
                  String(sr.journalOrInstitution ?? '[Source Placeholder]'),
                  160
                ),
                publicationDate: sanitizePlainText(
                  String(sr.publicationDate ?? '[Date Placeholder]'),
                  60
                ),
                doiOrUrl: isSafeUrlOrPath(rawDoi) ? rawDoi : 'https://doi.org/[DOI-Placeholder]',
                studyDesign: sanitizePlainText(
                  String(sr.studyDesign ?? '[Study Design Placeholder]'),
                  140
                ),
              };
            })
          : [],
        relatedPseoPaths: Array.isArray(p.relatedPseoPaths)
          ? p.relatedPseoPaths.slice(0, 12).map((rp: unknown) => {
              const r = (rp && typeof rp === 'object' ? rp : {}) as Record<string, unknown>;
              const cat = sanitizePlainText(String(r.category ?? 'condition'), 40) as PseoCategory;
              return {
                title: sanitizePlainText(String(r.title ?? ''), 180),
                urlPath: sanitizePlainText(String(r.urlPath ?? '/conditions'), 180),
                category: VALID_PSEO_CATEGORIES.has(cat) ? cat : 'condition',
              };
            })
          : [],
        relatedArticleSlugs: Array.isArray(p.relatedArticleSlugs)
          ? p.relatedArticleSlugs
              .slice(0, 10)
              .map((r) => sanitizePlainText(String(r ?? ''), 140))
              .filter(Boolean)
          : [],
      });
    }
    sanitized.corePseoPages = cleanPseo;
  }

  if (
    !sanitized.articles &&
    !sanitized.authors &&
    !sanitized.sections &&
    !sanitized.corePseoPages
  ) {
    return {
      valid: false,
      error: 'Snapshot must include at least one valid collection (articles, authors, sections, or corePseoPages).',
    };
  }

  return { valid: true, sanitized };
}

// ---------------------------------------------------------------------------
// 7. Anti-Scraping Bot Classification & Invisible Ownership Watermarking
// ---------------------------------------------------------------------------

export {
  type TrafficClassification,
  PRODUCTION_READER_RPM_LIMIT,
  PRODUCTION_UNVERIFIED_BOT_RPM_LIMIT,
  PREVIEW_READER_RPM_LIMIT,
  PREVIEW_UNVERIFIED_BOT_RPM_LIMIT,
  getEffectiveRateLimits,
  isStaticOrHmrRequest,
  classifyBotTraffic,
  isAlwaysAllowedSeoOrLogoPath,
  isAssetRefererAllowed,
  recordPageRequestAndGetRpm,
  resetPageRateBucketsForTesting,
} from './traffic-guard';

// Zero-width binary watermark encoding 16-bit checksum of slug so copied prose
// retains cryptographic proof of origin from TherapistPsychologistToday.com.
const ZW_ZERO = '\u200B'; // Zero-width space
const ZW_ONE = '\u200C'; // Zero-width non-joiner
const ZW_BOUNDARY = '\u200D'; // Zero-width joiner

export function computeSlugChecksum16(slug: string): number {
  const digest = crypto
    .createHmac('sha256', 'TherapistPsychologistToday.com-Watermark')
    .update(slug)
    .digest();
  return digest.readUInt16BE(0);
}

export function embedOwnershipWatermark(paragraph: string, slug: string): string {
  if (!paragraph || !slug) return paragraph;
  const checksum = computeSlugChecksum16(slug);
  const bits = checksum.toString(2).padStart(16, '0');
  const encoded =
    ZW_BOUNDARY +
    bits
      .split('')
      .map((b) => (b === '1' ? ZW_ONE : ZW_ZERO))
      .join('') +
    ZW_BOUNDARY;

  const firstSpaceIdx = paragraph.indexOf(' ');
  if (firstSpaceIdx === -1) return paragraph + encoded;
  return paragraph.slice(0, firstSpaceIdx) + encoded + paragraph.slice(firstSpaceIdx);
}

export function verifyOwnershipWatermark(watermarkedText: string, slug: string): boolean {
  const start = watermarkedText.indexOf(ZW_BOUNDARY);
  if (start === -1) return false;
  const end = watermarkedText.indexOf(ZW_BOUNDARY, start + 1);
  if (end === -1 || end - start - 1 !== 16) return false;
  const payload = watermarkedText.slice(start + 1, end);
  let bits = '';
  for (const ch of payload) {
    if (ch === ZW_ONE) bits += '1';
    else if (ch === ZW_ZERO) bits += '0';
    else return false;
  }
  const extractedChecksum = parseInt(bits, 2);
  return extractedChecksum === computeSlugChecksum16(slug);
}

// Signed Image Token to prevent external hotlinking and unauthorized media access
export function signImageAssetToken(assetId: string): string {
  const secret = process.env.IMAGE_SIGNING_SECRET || 'tpt_hotlink_guard_secret_2026';
  return crypto.createHmac('sha256', secret).update(assetId).digest('hex').slice(0, 32);
}

export function verifyImageAssetToken(assetId: string, token: string): boolean {
  if (!assetId || !token) return false;
  const expected = signImageAssetToken(assetId);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(token, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ============================================================================
// PHASE 6: STRICT CONTENT-SECURITY-POLICY & MAGIC-BYTE IMAGE SANITIZATION
// ============================================================================

export function buildCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://picsum.photos",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB strict limit

export type AllowedImageMagicFormat = 'jpeg' | 'png' | 'gif' | 'webp';

export interface MagicByteValidationResult {
  valid: boolean;
  detectedFormat?: AllowedImageMagicFormat;
  error?: string;
}

/**
 * Inspects the raw binary header bytes (magic bytes) of an uploaded file buffer.
 * Never trusts client-supplied Content-Type or filename extension.
 */
export function verifyImageMagicBytes(buffer: Uint8Array | Buffer): MagicByteValidationResult {
  if (!buffer || buffer.byteLength < 12) {
    return {
      valid: false,
      error: 'File is too small to contain a valid image header (minimum 12 bytes).',
    };
  }

  if (buffer.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    return {
      valid: false,
      error: `Image exceeds the maximum allowed upload size of ${MAX_IMAGE_UPLOAD_BYTES} bytes (5 MB).`,
    };
  }

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpeg) {
    return { valid: true, detectedFormat: 'jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  if (isPng) {
    return { valid: true, detectedFormat: 'png' };
  }

  // GIF87a (47 49 46 38 37 61) or GIF89a (47 49 46 38 39 61)
  const isGif =
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61;
  if (isGif) {
    return { valid: true, detectedFormat: 'gif' };
  }

  // WebP: "RIFF" (52 49 46 46) at 0..3 and "WEBP" (57 45 42 50) at 8..11
  const isWebp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;
  if (isWebp) {
    return { valid: true, detectedFormat: 'webp' };
  }

  return {
    valid: false,
    error:
      'Invalid image magic bytes. Only genuine JPEG, PNG, WebP, or GIF binary headers are accepted.',
  };
}

export function generateRandomWebpFilename(): string {
  return `${crypto.randomBytes(16).toString('hex')}.webp`;
}

export function isValidUploadedImageFilename(filename: string): boolean {
  return /^[a-f0-9]{32}\.webp$/.test(filename);
}

