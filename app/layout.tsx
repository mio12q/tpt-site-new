import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  Libre_Baskerville,
  Playfair_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-baskerville',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const CANONICAL_BASE = process.env.APP_URL || 'https://therapistpsychologisttoday.com';

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_BASE),
  title: {
    default: 'Therapist Psychologist Today — Clinical Psychiatry, Research & Mental Health News',
    template: '%s | Therapist Psychologist Today',
  },
  description:
    'Independent medical journalism, peer-reviewed psychiatry research, DSM-5-TR condition explainers, and evidence-based treatment analysis at TherapistPsychologistToday.com.',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  icons: {
    icon: '/brain-icon.png',
    shortcut: '/brain-icon.png',
    apple: '/brain-icon.png',
  },
  openGraph: {
    title: 'Therapist Psychologist Today — Clinical Psychiatry & Behavioral Medicine News',
    description:
      'Independent medical journalism, peer-reviewed psychiatry research, DSM-5-TR condition explainers, and evidence-based treatment analysis.',
    url: CANONICAL_BASE,
    siteName: 'Therapist Psychologist Today',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Therapist Psychologist Today — Clinical Psychiatry & Mental Health News',
    description:
      'Independent medical journalism, peer-reviewed psychiatry research, DSM-5-TR condition explainers, and evidence-based treatment analysis.',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Therapist Psychologist Today',
    url: CANONICAL_BASE,
    publishingPrinciples: `${CANONICAL_BASE}/editorial-policy`,
    correctionsPolicy: `${CANONICAL_BASE}/corrections-policy`,
    ethicsPolicy: `${CANONICAL_BASE}/medical-review-process`,
    description:
      'Independent medical news publication covering clinical psychiatry, behavioral neuroscience, public health, and evidence-based psychotherapies.',
  };

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${baskerville.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="bg-[#FAFAF7] text-[#111111] font-serif antialiased selection:bg-[#EEF2FB] selection:text-[#1E48B8]" suppressHydrationWarning>
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

