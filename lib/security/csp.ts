/**
 * Returns true ONLY when NODE_ENV is not "production" or when ALLOW_PREVIEW_FRAMING="true" is set.
 * In production (without ALLOW_PREVIEW_FRAMING="true"), framing is strictly denied.
 */
export function isPreviewFramingAllowed(
  env: Record<string, string | undefined> = process.env
): boolean {
  const nodeEnv = env.NODE_ENV || 'development';
  return nodeEnv !== 'production' || env.ALLOW_PREVIEW_FRAMING === 'true';
}

/**
 * Strict Content-Security-Policy header builder with per-request cryptographic nonce.
 * Includes all required directives:
 * - default-src 'self'
 * - frame-ancestors 'none' (in production; omitted when allowPreviewFraming is true for AI Studio preview iframe)
 * - object-src 'none'
 * - base-uri 'self'
 * - form-action 'self'
 * - upgrade-insecure-requests (in production)
 * - script-src 'self' 'nonce-...' (for inline JSON-LD and Next.js hydration scripts)
 */
export function buildCspHeader(
  nonce: string,
  options?: { allowPreviewFraming?: boolean }
): string {
  const allowFraming = options?.allowPreviewFraming ?? false;

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://picsum.photos",
    "font-src 'self' data:",
    "connect-src 'self'",
    allowFraming ? "frame-ancestors 'self' https: http:" : "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (!allowFraming) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}

