import dns from 'node:dns/promises';
import { classifyBotTraffic, type TrafficClassification } from './traffic-guard';

export interface ReverseDnsVerificationResult {
  ipAddress: string;
  userAgent: string;
  reverseDnsHost: string | null;
  forwardConfirmed: boolean;
  classification: TrafficClassification;
}

/**
 * Performs Forward-Confirmed Reverse DNS (FCrDNS) verification on the Node.js runtime
 * (per Google's official Googlebot verification specification: PTR lookup -> A/AAAA forward check)
 * and passes the result to classifyBotTraffic().
 */
export async function verifySearchCrawlerByReverseDns(params: {
  ipAddress: string;
  userAgent: string;
  requestsPerMinute?: number;
}): Promise<ReverseDnsVerificationResult> {
  const ip = (params.ipAddress || '').trim();
  const ua = params.userAgent || '';

  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    const classification = classifyBotTraffic({
      userAgent: ua,
      requestsPerMinute: params.requestsPerMinute,
    });
    return {
      ipAddress: ip || '127.0.0.1',
      userAgent: ua,
      reverseDnsHost: null,
      forwardConfirmed: false,
      classification,
    };
  }

  let reverseDnsHost: string | null = null;
  let forwardConfirmed = false;

  try {
    const hostnames = await dns.reverse(ip);
    if (hostnames && hostnames.length > 0) {
      const candidateHost = hostnames[0].toLowerCase().replace(/\.$/, '');
      reverseDnsHost = candidateHost;

      // Forward-confirm that the hostname resolves back to the same IP
      const resolvedAddresses = await dns.lookup(candidateHost, { all: true });
      forwardConfirmed = resolvedAddresses.some((entry) => entry.address === ip);
    }
  } catch {
    reverseDnsHost = null;
    forwardConfirmed = false;
  }

  // If PTR lookup failed or forward-DNS did not match on a non-local IP claiming to be Googlebot/Bingbot,
  // pass 'unverified-or-spoofed.invalid' so classifyBotTraffic flags spoofed search bots.
  const effectiveDnsHost =
    reverseDnsHost && forwardConfirmed ? reverseDnsHost : 'unverified-or-spoofed.invalid';

  const classification = classifyBotTraffic({
    userAgent: ua,
    requestsPerMinute: params.requestsPerMinute,
    verifiedReverseDnsHost: effectiveDnsHost,
  });

  return {
    ipAddress: ip,
    userAgent: ua,
    reverseDnsHost,
    forwardConfirmed,
    classification,
  };
}
