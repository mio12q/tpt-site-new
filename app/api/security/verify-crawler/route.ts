import { NextRequest, NextResponse } from 'next/server';
import { extractClientIp } from '@/lib/security';
import { verifySearchCrawlerByReverseDns } from '@/lib/security/rdns-verifier';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const queryIp = req.nextUrl.searchParams.get('ip');
  const queryUa = req.nextUrl.searchParams.get('ua');

  const ipAddress =
    queryIp ||
    extractClientIp({
      headers: req.headers,
      directIp: (req as { ip?: string }).ip,
    });
  const userAgent = queryUa ?? (req.headers.get('user-agent') || '');

  const result = await verifySearchCrawlerByReverseDns({
    ipAddress,
    userAgent,
  });

  return NextResponse.json(result, {
    status: result.classification === 'blocked_scraper' ? 403 : 200,
  });
}
