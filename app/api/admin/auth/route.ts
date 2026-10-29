import { NextRequest, NextResponse } from 'next/server';
import { findAdminUserForAuth } from '@/lib/services/publication-service';
import {
  SESSION_ABSOLUTE_MAX_MS,
  appendAuditLog,
  checkLoginRateLimit,
  clearLoginFailures,
  createSession,
  extractClientIp,
  getAuditLogs,
  invalidateSession,
  recordLoginFailure,
  verifyIpAllowlist,
  verifyPassword,
  verifySessionCookie,
  verifyTotpCode,
} from '@/lib/security';

const COOKIE_NAME = 'tpt_admin_session';

export async function GET(req: NextRequest) {
  const ip = extractClientIp({
    headers: req.headers,
    directIp: (req as { ip?: string }).ip,
  });

  if (!verifyIpAllowlist(ip)) {
    appendAuditLog({
      actorUsername: 'unauthenticated',
      actorRole: 'unauthenticated',
      action: 'auth:ip_blocked',
      resource: '/api/admin/auth',
      ipAddress: ip,
      status: 'denied',
      details: 'Request IP not in ADMIN_IP_ALLOWLIST.',
    });
    return NextResponse.json(
      { authenticated: false, error: 'Forbidden' },
      {
        status: 403,
        headers: { 'X-Robots-Tag': 'noindex, nofollow' },
      }
    );
  }

  const cookieVal = req.cookies.get(COOKIE_NAME)?.value;
  const session = verifySessionCookie(cookieVal);
  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 200,
        headers: { 'X-Robots-Tag': 'noindex, nofollow' },
      }
    );
  }
  return NextResponse.json(
    {
      authenticated: true,
      user: {
        username: session.username,
        displayName: session.displayName,
        role: session.role,
      },
      csrfToken: session.csrfToken,
      auditLogs: getAuditLogs(),
    },
    {
      headers: { 'X-Robots-Tag': 'noindex, nofollow' },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const ip = extractClientIp({
      headers: req.headers,
      directIp: (req as { ip?: string }).ip,
    });

    if (!verifyIpAllowlist(ip)) {
      appendAuditLog({
        actorUsername: 'unauthenticated',
        actorRole: 'unauthenticated',
        action: 'auth:ip_blocked',
        resource: '/api/admin/auth',
        ipAddress: ip,
        status: 'denied',
        details: 'Request IP not in ADMIN_IP_ALLOWLIST.',
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 403 });
    }

    const body = await req.json();
    const action = body?.action || 'login';

    if (action === 'logout') {
      const cookieVal = req.cookies.get(COOKIE_NAME)?.value;
      const existing = verifySessionCookie(cookieVal);
      invalidateSession(cookieVal);
      if (existing) {
        appendAuditLog({
          actorUsername: existing.username,
          actorRole: existing.role,
          action: 'auth:logout',
          resource: '/secretadmin2026here',
          ipAddress: ip,
          status: 'success',
          details: 'Server-side session invalidated and cookie cleared.',
        });
      }
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });
      return res;
    }

    const username = String(body?.username || '').trim();
    const password = String(body?.password || '');
    const totpCode = String(body?.totpCode || '').trim();
    const rateKey = `${ip}:${username.toLowerCase()}`;

    const rateCheck = checkLoginRateLimit(rateKey);
    if (!rateCheck.allowed) {
      appendAuditLog({
        actorUsername: username || 'unknown',
        actorRole: 'unauthenticated',
        action: 'auth:lockout_enforced',
        resource: '/secretadmin2026here',
        ipAddress: ip,
        status: 'locked_out',
        details: 'Account temporarily locked out after 5 failed authentication attempts.',
      });
      return NextResponse.json(
        {
          error: 'Account temporarily locked due to repeated failed attempts. Try again in 15 minutes.',
          lockedUntil: rateCheck.lockedUntil,
        },
        { status: 429 }
      );
    }

    const user = await findAdminUserForAuth(username);
    const passwordValid = user ? verifyPassword(password, user.passwordHash) : false;

    if (!user || !passwordValid) {
      const failure = recordLoginFailure(rateKey);
      appendAuditLog({
        actorUsername: username || 'unknown',
        actorRole: 'unauthenticated',
        action: 'auth:login_failed',
        resource: '/secretadmin2026here',
        ipAddress: ip,
        status: failure.lockedOut ? 'locked_out' : 'denied',
        details: `Generic Invalid credentials returned; remaining attempts: ${failure.remainingAttempts}.`,
      });
      // Always return generic "Invalid credentials" that never reveals if username exists
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remainingAttempts: failure.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // TOTP 2FA enforcement when enabled on user account or when ADMIN_TOTP_SECRET is configured
    const totpSecret = (process.env.ADMIN_TOTP_SECRET || '').trim();
    if (user.totpEnabled || (totpSecret && totpCode)) {
      if (!totpSecret || !totpCode || !verifyTotpCode(totpCode, totpSecret)) {
        const failure = recordLoginFailure(rateKey);
        appendAuditLog({
          actorUsername: user.username,
          actorRole: user.role,
          action: 'auth:totp_failed',
          resource: '/secretadmin2026here',
          ipAddress: ip,
          status: 'denied',
          details: 'Invalid or missing TOTP two-factor authentication code.',
        });
        return NextResponse.json(
          {
            error: 'Invalid credentials',
            remainingAttempts: failure.remainingAttempts,
          },
          { status: 401 }
        );
      }
    }

    clearLoginFailures(rateKey);
    const { signedCookieValue, session } = createSession(user);

    appendAuditLog({
      actorUsername: user.username,
      actorRole: user.role,
      action: 'auth:login_success',
      resource: '/secretadmin2026here',
      ipAddress: ip,
      status: 'success',
      details: `Session rotated (${user.role.toUpperCase()} RBAC scope); HttpOnly SameSite=Strict cookie issued.`,
    });

    const res = NextResponse.json({
      authenticated: true,
      user: {
        username: session.username,
        displayName: session.displayName,
        role: session.role,
      },
      csrfToken: session.csrfToken,
      auditLogs: getAuditLogs(),
    });

    res.cookies.set(COOKIE_NAME, signedCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: Math.floor(SESSION_ABSOLUTE_MAX_MS / 1000), // 8h absolute cap (server enforces 30m sliding idle timeout)
    });

    return res;
  } catch {
    // Never leak internal stack traces
    return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 500 });
  }
}
