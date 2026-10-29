'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrainRootsIcon } from '../brand/BrandLogo';

export function NewsletterBlock({ variant = 'light-tint' }: { variant?: 'light-tint' | 'royal-blue' }) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, frequency, honeypot }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Unable to process subscription.');
        return;
      }
      setStatus('success');
      setMessage(
        data.message ||
          'Subscribed to The Morning Clinical Briefing. Verification dispatched.'
      );
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Network error while contacting subscription server. Please try again.');
    }
  }

  const isBlue = variant === 'royal-blue';

  return (
    <section
      aria-labelledby="newsletter-heading"
      className={
        isBlue
          ? 'bg-[#1E48B8] text-white p-6 sm:p-8 border border-[#1E48B8]'
          : 'bg-[#EEF2FB] text-[#111111] p-6 sm:p-8 border border-[#1E48B8]/25'
      }
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center gap-2.5">
            <BrainRootsIcon variant={isBlue ? 'white-on-blue' : 'blue-on-light'} size={28} />
            <span
              className={`text-[11px] font-sans font-bold uppercase tracking-widest ${
                isBlue ? 'text-blue-100' : 'text-[#1F44A8]'
              }`}
            >
              The Morning Clinical Briefing · Free Editorial Dispatch
            </span>
          </div>
          <h2
            id="newsletter-heading"
            className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight ${
              isBlue ? 'text-white' : 'text-[#111111]'
            }`}
          >
            Peer-Reviewed Psychiatric News, Delivered Every Morning.
          </h2>
          <p
            className={`text-sm font-serif leading-relaxed ${
              isBlue ? 'text-blue-100' : 'text-neutral-700'
            }`}
          >
            Receive primary-source clinical summaries, research dispatches, and structured condition
            and treatment updates directly in your inbox.
          </p>
        </div>

        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {/* Anti-Bot Honeypot Field (hidden from assistive tech and humans) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="tpt-website-url">Leave this field blank</label>
              <input
                id="tpt-website-url"
                type="text"
                name="website_url_honeypot"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-sans">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="newsletter-freq"
                  checked={frequency === 'daily'}
                  onChange={() => setFrequency('daily')}
                  className="accent-[#1E48B8]"
                />
                <span>Daily Briefing</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="newsletter-freq"
                  checked={frequency === 'weekly'}
                  onChange={() => setFrequency('weekly')}
                  className="accent-[#1E48B8]"
                />
                <span>Weekly Research Digest</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="newsletter-email-input" className="sr-only">
                Email address for clinical briefing
              </label>
              <input
                id="newsletter-email-input"
                type="email"
                required
                placeholder="clinician@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 px-3.5 py-2.5 text-sm font-sans border focus:outline-none focus:ring-2 ${
                  isBlue
                    ? 'bg-white text-[#111111] border-white focus:ring-blue-200'
                    : 'bg-white text-[#111111] border-[#E5E5E0] focus:ring-[#1E48B8]'
                }`}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`px-5 py-2.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  isBlue
                    ? 'bg-[#111111] text-white hover:bg-neutral-800'
                    : 'bg-[#1E48B8] text-white hover:bg-[#1E3A8A]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{status === 'submitting' ? 'Verifying...' : 'Subscribe'}</span>
              </button>
            </div>

            {status === 'success' && (
              <div
                role="status"
                className={`flex items-center gap-2 text-xs font-sans pt-1 ${
                  isBlue ? 'text-blue-100' : 'text-[#1F44A8] font-medium'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div
                role="alert"
                className={`flex items-center gap-2 text-xs font-sans pt-1 ${
                  isBlue ? 'text-amber-200' : 'text-red-700 font-medium'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{message}</span>
              </div>
            )}

            <p
              className={`text-[11px] font-sans ${
                isBlue ? 'text-blue-200' : 'text-neutral-500'
              }`}
            >
              Protected by rate-limiting &amp; anti-bot verification. Zero third-party data sharing.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
