import fs from 'node:fs';
import path from 'node:path';
import {
  type PgQueryExecutor,
  createMigrationPostgresPool,
  sanitizeDatabaseError,
} from '../lib/db/postgres-pool';

export async function runMigrations(
  customPool?: PgQueryExecutor,
  migrationsDir: string = path.join(process.cwd(), 'db', 'migrations')
): Promise<{ applied: string[]; skipped: string[] }> {
  const migrationUrl = (
    process.env.DATABASE_MIGRATION_URL ||
    process.env.DATABASE_URL ||
    ''
  ).trim();

  if (!customPool && !migrationUrl) {
    throw new Error(
      'Missing DATABASE_MIGRATION_URL (or DATABASE_URL). Set DATABASE_MIGRATION_URL to the owner/migration role connection string before running migrations.'
    );
  }

  const pool = customPool || createMigrationPostgresPool(migrationUrl);
  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(120) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const existingRes = await pool.query<{ version: string }>(
      'SELECT version FROM schema_migrations ORDER BY version ASC'
    );
    const appliedSet = new Set(existingRes.rows.map((r) => r.version));

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        skipped.push(file);
        continue;
      }

      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query('BEGIN');
      try {
        await pool.query(sqlContent);
        await pool.query(
          'INSERT INTO schema_migrations (version, applied_at) VALUES ($1, NOW())',
          [file]
        );
        await pool.query('COMMIT');
        applied.push(file);
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    }

    return { applied, skipped };
  } finally {
    if (!customPool && pool.end) {
      await pool.end();
    }
  }
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith('db-migrate.ts');

if (isDirectExecution) {
  runMigrations()
    .then(({ applied, skipped }) => {
      console.log(
        `[db:migrate] Completed successfully. Applied: ${applied.length} (${applied.join(', ') || 'none'}). Skipped already applied: ${skipped.length}.`
      );
    })
    .catch((err) => {
      console.error('[db:migrate] Migration failed:', sanitizeDatabaseError(err));
      process.exit(1);
    });
}
