import { NextRequest, NextResponse } from 'next/server';
import {
  checkEndpointRateLimit,
  classifyBotTraffic,
  validateNewsletterSubmission,
} from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = req.headers.get('user-agent') || '';

    const botClass = classifyBotTraffic({ userAgent: ua });
    if (botClass === 'blocked_scraper') {
      return NextResponse.json({ error: 'Automated requests not permitted.' }, { status: 403 });
    }

    const rate = checkEndpointRateLimit(`newsletter:${ip}`, 8, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please wait one minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = validateNewsletterSubmission({
      email: body?.email,
      honeypot: body?.honeypot,
      frequency: body?.frequency,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid email address.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Confirmation sent to ${validation.sanitizedEmail} (${
        body?.frequency === 'weekly' ? 'Weekly Research Digest' : 'Daily Clinical Briefing'
      }).`,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
  }
}
