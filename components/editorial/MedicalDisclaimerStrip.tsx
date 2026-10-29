import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export function MedicalDisclaimerStrip({
  lastReviewedAt,
  reviewerName = '[Reviewer Name]',
  reviewerCredentials = '[Credentials]',
  reviewerSlug = 'reviewer-placeholder',
}: {
  lastReviewedAt?: string;
  reviewerName?: string;
  reviewerCredentials?: string;
  reviewerSlug?: string;
}) {
  const formattedReviewDate = lastReviewedAt
    ? new Date(lastReviewedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '[Review Date]';

  return (
    <aside
      aria-label="Medical information disclaimer"
      className="bg-[#EEF2FB] border border-[#1E48B8]/25 px-4 py-3.5 my-4 text-xs sm:text-[13px] font-sans text-[#111111] leading-relaxed"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#1E48B8] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong className="font-semibold text-[#1E48B8]">
              Clinical &amp; Editorial Disclaimer:
            </strong>{' '}
            Content published by <em>Therapist Psychologist Today</em> is for informational and
            educational purposes only and does not constitute medical advice, psychiatric diagnosis,
            or clinical treatment. Always consult a qualified healthcare professional. In a medical
            or psychiatric emergency, call or text{' '}
            <Link
              href="/crisis-resources"
              className="font-semibold text-[#1F44A8] underline hover:text-[#111111]"
            >
              988 (US/Canada) or view International Crisis Resources
            </Link>
            .
          </p>
        </div>
        {reviewerName && (
          <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E48B8]/15 text-[11px] text-neutral-700">
            <span className="block">
              Medically reviewed by{' '}
              {reviewerSlug ? (
                <Link
                  href={`/authors/${reviewerSlug}`}
                  className="font-semibold text-[#1F44A8] underline hover:text-[#111111]"
                >
                  {reviewerName}, {reviewerCredentials}
                </Link>
              ) : (
                <strong className="font-semibold text-[#111111]">
                  {reviewerName}, {reviewerCredentials}
                </strong>
              )}
            </span>
            <span className="block text-neutral-600 font-mono">
              Last reviewed: {formattedReviewDate}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
