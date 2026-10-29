import { NextRequest, NextResponse } from 'next/server';
import {
  extractClientIp,
  verifyIpAllowlist,
  verifySessionCookie,
  verifyCsrfToken,
  MAX_IMAGE_UPLOAD_BYTES,
  verifyImageMagicBytes,
  appendAuditLog,
  getAuditLogs,
} from '@/lib/security';
import { storeSanitizedWebpUpload } from '@/lib/security/image-processor';

const COOKIE_NAME = 'tpt_admin_session';

export async function POST(req: NextRequest) {
  const ip = extractClientIp({
    headers: req.headers,
    directIp: (req as { ip?: string }).ip,
  });

  if (!verifyIpAllowlist(ip)) {
    appendAuditLog({
      actorUsername: 'unauthenticated',
      actorRole: 'unauthenticated',
      action: 'IP_ALLOWLIST_BLOCK',
      resource: '/api/admin/upload',
      ipAddress: ip,
      status: 'denied',
      details: 'Client IP is not in ADMIN_IP_ALLOWLIST.',
    });
    return NextResponse.json(
      { error: 'Access denied by IP allowlist policy.' },
      { status: 403 }
    );
  }

  const cookieVal = req.cookies.get(COOKIE_NAME)?.value;
  const session = verifySessionCookie(cookieVal);
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    );
  }

  // Require admin or editor session
  if (session.role !== 'admin' && session.role !== 'editor') {
    appendAuditLog({
      actorUsername: session.username,
      actorRole: session.role,
      action: 'IMAGE_UPLOAD_RBAC_DENIED',
      resource: '/api/admin/upload',
      ipAddress: ip,
      status: 'denied',
      details: `Role '${session.role}' attempted image upload; admin or editor role is required.`,
    });
    return NextResponse.json(
      { error: 'Forbidden: Admin or Editor role is required to upload images.' },
      { status: 403 }
    );
  }

  // Require CSRF token
  const csrfHeader = req.headers.get('x-csrf-token') || undefined;
  if (!verifyCsrfToken(session, csrfHeader)) {
    appendAuditLog({
      actorUsername: session.username,
      actorRole: session.role,
      action: 'CSRF_VERIFICATION_FAILED',
      resource: '/api/admin/upload',
      ipAddress: ip,
      status: 'denied',
      details: 'Missing or invalid X-CSRF-Token header on image upload.',
    });
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token.' },
      { status: 403 }
    );
  }

  // Fast pre-check on Content-Length header (allow 64 KB multipart boundary overhead)
  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_UPLOAD_BYTES + 65536) {
      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'IMAGE_UPLOAD_OVERSIZED',
        resource: '/api/admin/upload',
        ipAddress: ip,
        status: 'denied',
        details: `Rejected upload with Content-Length ${contentLength} bytes (> 5 MB limit).`,
      });
      return NextResponse.json(
        { error: 'Image file exceeds the maximum allowed size of 5 MB.' },
        { status: 413 }
      );
    }
  }

  try {
    const formData = await req.formData();
    const fileEntry = formData.get('file');

    if (!fileEntry || typeof fileEntry === 'string' || typeof fileEntry.arrayBuffer !== 'function') {
      return NextResponse.json(
        { error: 'Missing image file in multipart form field "file".' },
        { status: 400 }
      );
    }

    if (fileEntry.size === 0) {
      return NextResponse.json(
        { error: 'Uploaded image file is empty.' },
        { status: 400 }
      );
    }

    if (fileEntry.size > MAX_IMAGE_UPLOAD_BYTES) {
      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'IMAGE_UPLOAD_OVERSIZED',
        resource: fileEntry.name || 'upload',
        ipAddress: ip,
        status: 'denied',
        details: `Rejected upload of ${fileEntry.size} bytes (> 5 MB limit).`,
      });
      return NextResponse.json(
        { error: 'Image file exceeds the maximum allowed size of 5 MB.' },
        { status: 413 }
      );
    }

    const rawBuffer = Buffer.from(await fileEntry.arrayBuffer());

    // Verify magic bytes directly (do not trust fileEntry.type or extension)
    const magicCheck = verifyImageMagicBytes(rawBuffer);
    if (!magicCheck.valid) {
      appendAuditLog({
        actorUsername: session.username,
        actorRole: session.role,
        action: 'IMAGE_UPLOAD_MAGIC_BYTES_REJECTED',
        resource: fileEntry.name || 'upload',
        ipAddress: ip,
        status: 'denied',
        details: magicCheck.error || 'Magic byte validation failed.',
      });
      return NextResponse.json(
        { error: magicCheck.error || 'Invalid image magic bytes.' },
        { status: 400 }
      );
    }

    const stored = await storeSanitizedWebpUpload(rawBuffer);

    appendAuditLog({
      actorUsername: session.username,
      actorRole: session.role,
      action: 'IMAGE_UPLOAD_WEBP',
      resource: stored.filename,
      ipAddress: ip,
      status: 'success',
      details: `Verified ${stored.detectedFormat.toUpperCase()} magic bytes, stripped EXIF metadata, re-encoded to WebP (${stored.width}x${stored.height}, ${stored.byteLength} bytes).`,
    });

    return NextResponse.json({
      ok: true,
      filename: stored.filename,
      signedUrl: stored.signedUrl,
      width: stored.width,
      height: stored.height,
      byteLength: stored.byteLength,
      detectedFormat: stored.detectedFormat,
      auditLogs: getAuditLogs(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process image upload.';
    appendAuditLog({
      actorUsername: session.username,
      actorRole: session.role,
      action: 'IMAGE_UPLOAD_ERROR',
      resource: '/api/admin/upload',
      ipAddress: ip,
      status: 'denied',
      details: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
