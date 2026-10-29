-- ============================================================================
-- Migration 0003: Least-Privilege Grants for Restricted App Role (tpt_app_user)
-- ============================================================================
-- Ensures `tpt_app_user` has NO superuser rights, NO DDL privileges, and ONLY
-- SELECT, INSERT, UPDATE, DELETE on the required application tables.
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tpt_app_user') THEN
    -- First revoke all privileges (including TRUNCATE, REFERENCES, TRIGGER)
    EXECUTE 'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM tpt_app_user';
    EXECUTE 'REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM tpt_app_user';
    EXECUTE 'REVOKE CREATE ON SCHEMA public FROM tpt_app_user';

    -- Grant strictly USAGE on schema public and DML (SELECT, INSERT, UPDATE, DELETE) on needed tables
    EXECUTE 'GRANT USAGE ON SCHEMA public TO tpt_app_user';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sections, authors, articles, pseo_pages, admin_users, audit_logs TO tpt_app_user';

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'schema_migrations'
    ) THEN
      EXECUTE 'GRANT SELECT ON TABLE schema_migrations TO tpt_app_user';
    END IF;
  END IF;
END
$$;
