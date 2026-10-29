import React from 'react';
import type { ClinicalFigureSpec } from '@/lib/domain/types';

export function ClinicalFigure({
  figure,
  priority = false,
}: {
  figure: ClinicalFigureSpec;
  priority?: boolean;
}) {
  const maxVal = Math.max(
    ...figure.dataPoints.map((d) => Math.max(d.value, d.secondaryValue || 0)),
    10
  );

  return (
    <figure
      className="my-6 border border-[#E5E5E0] bg-white p-5 sm:p-6"
      aria-label={figure.title}
    >
      {/* Figure Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#E5E5E0]">
        <div>
          <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#1F44A8] block mb-1">
            Clinical Data &amp; Neuroimaging Figure
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#111111] leading-snug">
            {figure.title}
          </h3>
          <p className="text-xs sm:text-sm font-sans text-neutral-600 mt-0.5">
            {figure.subtitle}
          </p>
        </div>
        <span className="text-[11px] font-mono text-neutral-500 whitespace-nowrap shrink-0">
          {priority ? 'Primary Study Readout' : 'Peer-Reviewed Dataset'}
        </span>
      </div>

      {/* SVG Scientific Schematic + Quantitative Bars */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Vector Anatomical / Statistical Illustration */}
        <div className="lg:col-span-5 bg-[#FAFAF7] border border-[#E5E5E0] p-4 flex flex-col items-center justify-center relative">
          <svg
            viewBox="0 0 320 210"
            className="w-full h-auto max-h-48"
            role="img"
            aria-label={`${figure.title} schematic`}
          >
            <rect width="320" height="210" fill="#FAFAF7" />
            {/* Subtle Coordinate Grid */}
            <g stroke="#E5E5E0" strokeWidth="1" strokeDasharray="3 3">
              <line x1="20" y1="40" x2="300" y2="40" />
              <line x1="20" y1="95" x2="300" y2="95" />
              <line x1="20" y1="150" x2="300" y2="150" />
              <line x1="90" y1="20" x2="90" y2="180" />
              <line x1="160" y1="20" x2="160" y2="180" />
              <line x1="230" y1="20" x2="230" y2="180" />
            </g>

            {figure.type === 'neuro-pathway' || figure.type === 'biomarker-matrix' ? (
              <g>
                {/* Sagittal Brain Circuit Diagram (dlPFC -> sgACC -> Amygdala) */}
                <path
                  d="M75 135 C52 128, 42 98, 56 72 C70 44, 118 32, 168 36 C218 40, 258 66, 262 102 C265 130, 238 152, 202 154 C180 155, 162 142, 142 146 Z"
                  fill="#EEF2FB"
                  stroke="#1E48B8"
                  strokeWidth="2.2"
                />
                {/* Prefrontal Node (dlPFC) */}
                <circle cx="92" cy="76" r="12" fill="#1E48B8" />
                <text x="92" y="56" textAnchor="middle" fill="#111111" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                  dlPFC
                </text>
                {/* Subgenual ACC Node */}
                <circle cx="148" cy="102" r="10" fill="#111111" />
                <text x="148" y="86" textAnchor="middle" fill="#111111" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                  sgACC
                </text>
                {/* Limbic / Amygdala Node */}
                <circle cx="188" cy="126" r="11" fill="#1E48B8" fillOpacity="0.85" />
                <text x="218" y="130" fill="#111111" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                  Amygdala
                </text>
                {/* Functional Connectivity Vectors */}
                <path
                  d="M104 80 L138 98 M158 106 L178 120"
                  stroke="#1E48B8"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <path
                  d="M96 88 C118 122, 152 132, 177 128"
                  fill="none"
                  stroke="#1E48B8"
                  strokeWidth="2"
                />
              </g>
            ) : (
              <g>
                {/* Longitudinal Survival / Response Curve */}
                <polyline
                  fill="none"
                  stroke="#111111"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                  points="35,148 95,136 155,124 215,118 280,114"
                />
                <polyline
                  fill="none"
                  stroke="#1E48B8"
                  strokeWidth="3.2"
                  points="35,148 95,108 155,78 215,58 280,46"
                />
                {[
                  [35, 148],
                  [95, 108],
                  [155, 78],
                  [215, 58],
                  [280, 46],
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="4.5" fill="#1E48B8" />
                ))}
                <text x="278" y="36" textAnchor="end" fill="#1E48B8" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">
                  Active Intervention Arm
                </text>
                <text x="278" y="106" textAnchor="end" fill="#555555" fontSize="9" fontFamily="sans-serif">
                  Control / Placebo Arm
                </text>
              </g>
            )}

            {/* Discreet Brand Watermark on Original Graphics (Anti-Theft Requirement) */}
            <text
              x="310"
              y="200"
              textAnchor="end"
              fill="#1E48B8"
              fillOpacity="0.55"
              fontSize="8.5"
              fontFamily="serif"
              fontStyle="italic"
            >
              © TherapistPsychologistToday.com · Verified Medical Graphic
            </text>
          </svg>
        </div>

        {/* Right: Tabular Clinical Endpoint Comparison */}
        <div className="lg:col-span-7 space-y-3.5">
          {figure.dataPoints.map((dp, idx) => {
            const pct = Math.min(100, Math.round((dp.value / maxVal) * 100));
            const secPct =
              typeof dp.secondaryValue === 'number'
                ? Math.min(100, Math.round((dp.secondaryValue / maxVal) * 100))
                : null;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2 text-xs font-sans">
                  <span className="font-semibold text-[#111111]">{dp.label}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                    <span className="font-bold text-[#1F44A8]">
                      {dp.value} {dp.unit}
                    </span>
                    {dp.note && (
                      <span className="text-[11px] text-neutral-500">({dp.note})</span>
                    )}
                  </div>
                </div>
                <div className="w-full h-2.5 bg-[#EEF2FB] overflow-hidden">
                  <div
                    className="h-full bg-[#1E48B8]"
                    style={{ width: `${Math.max(12, pct)}%` }}
                  />
                </div>
                {secPct !== null && (
                  <div className="flex items-center gap-2">
                    <div className="w-full h-1.5 bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full bg-neutral-500"
                        style={{ width: `${Math.max(8, secPct)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      Comparator: {dp.secondaryValue}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption & Primary Source Attribution */}
      <figcaption className="mt-4 pt-3 border-t border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600 font-serif italic">
        <span>{figure.caption}</span>
        <span className="font-sans not-italic text-[11px] text-neutral-500 shrink-0">
          {figure.credit}
        </span>
      </figcaption>
    </figure>
  );
}
