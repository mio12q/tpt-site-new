import React from 'react';

interface BrandMarkProps {
  variant?: 'blue-on-light' | 'white-on-blue';
  className?: string;
  size?: number;
}

/**
 * Brain-and-Neuron-Roots Icon (brain-icon.png — brain mark only, no text).
 * Used in small icon spots (newsletter label, favicon/app icon, compact badges)
 * so the full wordmark is never squeezed or cropped inside a small square.
 */
export function BrainRootsIcon({
  className = '',
  size = 32,
}: BrandMarkProps) {
  return (
    <img
      src="/brain-icon.png"
      alt=""
      width={size}
      height={size}
      loading="eager"
      referrerPolicy="no-referrer"
      aria-hidden="true"
      className={`inline-block shrink-0 object-contain select-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Full Masthead, Compact Sticky Header & Footer Wordmark Component.
 * - Uses transparent /logo-blue.png on light backgrounds (masthead, compact sticky header)
 * - Uses transparent /logo-white.png on royal-blue / dark backgrounds (footer, dark sections)
 * - No background color, border, padding box, or filter.
 */
export function MastheadWordmark({
  variant = 'blue-on-light',
  compact = false,
}: {
  variant?: 'blue-on-light' | 'white-on-blue';
  compact?: boolean;
}) {
  const src = variant === 'white-on-blue' ? '/logo-white.png' : '/logo-blue.png';

  if (compact) {
    return (
      <img
        src={src}
        alt="Therapist Psychologist Today"
        width={262}
        height={59}
        loading="eager"
        referrerPolicy="no-referrer"
        className="h-9 sm:h-10 w-auto object-contain select-none"
      />
    );
  }

  if (variant === 'white-on-blue') {
    return (
      <img
        src="/logo-white.png"
        alt="Therapist Psychologist Today"
        width={540}
        height={151}
        loading="eager"
        fetchPriority="high"
        referrerPolicy="no-referrer"
        className="h-20 sm:h-24 md:h-28 w-auto max-w-full object-contain object-left select-none"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <img
        src="/logo-blue.png"
        alt="Therapist Psychologist Today"
        width={680}
        height={153}
        loading="eager"
        fetchPriority="high"
        referrerPolicy="no-referrer"
        className="h-16 sm:h-24 md:h-28 w-auto max-w-full object-contain select-none"
      />
    </div>
  );
}
