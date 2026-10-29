-- ============================================================================
-- Migration 0001: Least-Privilege Role Architecture
-- ============================================================================
-- Role Model:
--   1. Owner / Migration Role (`tpt_migration_owner` or the role connected via
--      DATABASE_MIGRATION_URL): Used ONLY to run migrations and seed data.
--   2. Restricted Application Role (`tpt_app_user`, connected via DATABASE_URL):
--      NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOINHERIT, NOREPLICATION, NOBYPASSRLS.
--      Has ZERO DDL privileges and only SELECT, INSERT, UPDATE, DELETE on the
--      publication tables.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tpt_migration_owner') THEN
    CREATE ROLE tpt_migration_owner NOLOGIN;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Managed PostgreSQL provider restricted CREATE ROLE tpt_migration_owner; continuing with current migration owner.';
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tpt_app_user') THEN
    CREATE ROLE tpt_app_user
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  ELSE
    ALTER ROLE tpt_app_user
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Managed PostgreSQL provider restricted role creation/alteration; ensure tpt_app_user is created in your cloud console.';
END
$$;

-- Prevent PUBLIC and the restricted application role from creating objects in schema public
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tpt_app_user') THEN
    EXECUTE 'REVOKE CREATE ON SCHEMA public FROM tpt_app_user';
    EXECUTE 'GRANT USAGE ON SCHEMA public TO tpt_app_user';
  END IF;
END
$$;
