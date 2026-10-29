export type SectionSlug =
  | 'latest-news'
  | 'mental-health'
  | 'research-studies'
  | 'public-health'
  | 'conditions'
  | 'treatments'
  | 'wellness'
  | 'opinion';

export interface SectionInfo {
  slug: SectionSlug;
  name: string;
  shortName: string;
  description: string;
  leadNote: string;
}

export interface PrimarySource {
  id: string;
  title: string;
  journalOrInstitution: string;
  publicationDate: string;
  doiOrUrl: string;
  studyDesign: string;
  sampleSize?: string;
}

export interface ClinicalFigureSpec {
  id: string;
  type: 'neuro-pathway' | 'clinical-trial-chart' | 'epidemiology-trend' | 'sleep-architecture' | 'biomarker-matrix' | 'public-health-map';
  title: string;
  subtitle: string;
  caption: string;
  credit: string;
  dataPoints: {
    label: string;
    value: number;
    secondaryValue?: number;
    unit: string;
    note?: string;
  }[];
}

export interface ArticleSectionBlock {
  heading?: string;
  paragraphs: string[];
  callout?: {
    title: string;
    items: string[];
  };
}

export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  section: SectionSlug;
  authorSlug: string;
  reviewerSlug: string;
  publishedAt: string; // ISO string
  updatedAt: string; // ISO string
  lastReviewedAt: string; // ISO string
  readingTimeMinutes: number;
  isBreaking?: boolean;
  isFeaturedLead?: boolean;
  isSecondaryLead?: boolean;
  isOpinion?: boolean;
  mostReadRank?: number;
  locationDateline: string;
  pullQuote: {
    quote: string;
    attribution: string;
  };
  keyTakeaways: string[];
  body: ArticleSectionBlock[];
  figure: ClinicalFigureSpec;
  primarySources: PrimarySource[];
  tags: string[];
  relatedArticleSlugs: string[];
  relatedPseoSlugs: string[];
}

export interface AuthorProfile {
  slug: string;
  name: string;
  credentials: string;
  role: string;
  institution: string;
  bio: string;
  education: string[];
  clinicalSpecialties: string[];
  peerReviewedPublications: number;
  conflictOfInterestDisclosure: string;
  isMedicalReviewer: boolean;
  orcid: string;
}

export type PseoCategory =
  | 'topic-hub'
  | 'condition'
  | 'treatment'
  | 'study-explainer'
  | 'glossary'
  | 'faq';

export interface PseoMetricRow {
  metric: string;
  value: string;
  clinicalReference: string;
  confidenceInterval?: string;
}

export interface PseoFaqItem {
  question: string;
  answer: string;
}

export interface PseoPage {
  slug: string;
  category: PseoCategory;
  urlPath: string;
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  dsmOrIcdCode?: string;
  evidenceGrade?: string;
  lastReviewedAt: string;
  updatedAt: string;
  reviewerSlug: string;
  authorSlug: string;
  clinicalSummary: string;
  neurobiologicalMechanism: string;
  diagnosticOrClinicalCriteria: string[];
  epidemiologyAndMetrics: PseoMetricRow[];
  treatmentOrClinicalProtocols: {
    name: string;
    efficacySummary: string;
    durationOrDosage: string;
    guidelineSource: string;
  }[];
  faqs: PseoFaqItem[];
  primarySources: PrimarySource[];
  relatedPseoPaths: { title: string; urlPath: string; category: PseoCategory }[];
  relatedArticleSlugs: string[];
}

export type AdminRole = 'admin' | 'editor' | 'author';

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  passwordHash: string;
  totpEnabled: boolean;
  lastLoginAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorUsername: string;
  actorRole: AdminRole | 'unauthenticated';
  action: string;
  resource: string;
  ipAddress: string;
  status: 'success' | 'denied' | 'locked_out';
  details: string;
}
