-- ============================================================================
-- Migration 0002: Publication Schema (Sections, Authors, Articles, pSEO Pages,
--                 Admin Users, and Audit Logs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sections (
  slug VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  short_name VARCHAR(60) NOT NULL,
  description TEXT NOT NULL,
  lead_note VARCHAR(200) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authors (
  slug VARCHAR(100) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  credentials VARCHAR(100) NOT NULL,
  role VARCHAR(160) NOT NULL,
  institution VARCHAR(200) NOT NULL,
  bio TEXT NOT NULL,
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  clinical_specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  peer_reviewed_publications INTEGER NOT NULL DEFAULT 0,
  conflict_of_interest_disclosure TEXT NOT NULL,
  is_medical_reviewer BOOLEAN NOT NULL DEFAULT FALSE,
  orcid VARCHAR(64) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  slug VARCHAR(160) PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  subtitle TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  section_slug VARCHAR(64) NOT NULL REFERENCES sections(slug) ON UPDATE CASCADE,
  author_slug VARCHAR(100) NOT NULL REFERENCES authors(slug) ON UPDATE CASCADE,
  reviewer_slug VARCHAR(100) NOT NULL REFERENCES authors(slug) ON UPDATE CASCADE,
  published_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_reviewed_at TIMESTAMPTZ NOT NULL,
  reading_time_minutes INTEGER NOT NULL DEFAULT 6,
  is_breaking BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured_lead BOOLEAN NOT NULL DEFAULT FALSE,
  is_secondary_lead BOOLEAN NOT NULL DEFAULT FALSE,
  is_opinion BOOLEAN NOT NULL DEFAULT FALSE,
  most_read_rank INTEGER NULL,
  location_dateline VARCHAR(120) NOT NULL,
  pull_quote JSONB NOT NULL,
  key_takeaways JSONB NOT NULL DEFAULT '[]'::jsonb,
  body JSONB NOT NULL,
  figure JSONB NOT NULL,
  primary_sources JSONB NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_article_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_pseo_slugs JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_section_slug ON articles (section_slug);
CREATE INDEX IF NOT EXISTS idx_articles_featured_lead ON articles (is_featured_lead) WHERE is_featured_lead = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_tags_gin ON articles USING GIN (tags);

CREATE TABLE IF NOT EXISTS pseo_pages (
  slug VARCHAR(160) PRIMARY KEY,
  category VARCHAR(40) NOT NULL,
  url_path VARCHAR(220) NOT NULL UNIQUE,
  title VARCHAR(260) NOT NULL,
  subtitle TEXT NOT NULL,
  meta_title VARCHAR(260) NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url VARCHAR(300) NOT NULL,
  dsm_or_icd_code VARCHAR(120) NULL,
  evidence_grade VARCHAR(120) NULL,
  last_reviewed_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  reviewer_slug VARCHAR(100) NOT NULL,
  author_slug VARCHAR(100) NOT NULL,
  clinical_summary TEXT NOT NULL,
  neurobiological_mechanism TEXT NOT NULL,
  diagnostic_or_clinical_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  epidemiology_and_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  treatment_or_clinical_protocols JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_pseo_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_article_slugs JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pseo_pages_category ON pseo_pages (category);

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(160) NOT NULL,
  role VARCHAR(24) NOT NULL CHECK (role IN ('admin', 'editor', 'author')),
  password_hash TEXT NOT NULL,
  totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(80) PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_username VARCHAR(80) NOT NULL,
  actor_role VARCHAR(32) NOT NULL,
  action VARCHAR(120) NOT NULL,
  resource VARCHAR(260) NOT NULL,
  ip_address VARCHAR(64) NOT NULL,
  status VARCHAR(24) NOT NULL CHECK (status IN ('success', 'denied', 'locked_out')),
  details TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
