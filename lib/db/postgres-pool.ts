import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

export interface PgQueryExecutor {
  query<R extends QueryResultRow = any>(
    text: string,
    values?: unknown[]
  ): Promise<QueryResult<R>>;
  end?(): Promise<void>;
}

export const DEFAULT_POOL_MAX = 10;
export const DEFAULT_POOL_MIN = 1;
export const DEFAULT_IDLE_TIMEOUT_MS = 30_000;
export const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;

/**
 * Redacts connection strings, passwords, and SQL parameter payloads from any error message
 * so sensitive secrets are never written to logs.
 */
export function sanitizeDatabaseError(err: unknown): string {
  const rawMessage =
    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Database operation failed';

  return rawMessage
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/(password\s*=\s*)[^\s&"']+/gi, '$1[REDACTED]')
    .replace(/(params\s*:\s*)\[[\s\S]*?\]/gi, '$1[REDACTED_PARAMS]');
}

/**
 * Determines whether the current execution is Next.js static build time (`next build`)
 * vs production runtime (`next start` / deployed server).
 */
export function isNextProductionBuildPhase(
  env: Record<string, string | undefined> = process.env
): boolean {
  return env.NEXT_PHASE === 'phase-production-build';
}

/**
 * Enforces Requirement 5:
 * In production (NODE_ENV=production), if DATABASE_URL is missing, fail with a clear error
 * instead of silently falling back to .cms-store.json.
 * The JSON fallback is permitted ONLY in local development, test, or AI Studio preview.
 */
export function assertProductionDatabaseUrl(
  env: Record<string, string | undefined> = process.env
): void {
  const dbUrl = (env.DATABASE_URL || '').trim();
  const isProd = env.NODE_ENV === 'production';

  if (isProd && !isNextProductionBuildPhase(env) && !dbUrl) {
    throw new Error(
      'FATAL: DATABASE_URL is required when NODE_ENV=production. Refusing to silently fall back to .cms-store.json in production.'
    );
  }
}

/**
 * Builds a pg.PoolConfig with SSL support (for managed providers like Neon requiring sslmode=require)
 * and sensible connection pool limits.
 * Never logs the connection string or password.
 */
export function buildPgPoolConfig(
  connectionString: string,
  env: Record<string, string | undefined> = process.env
): PoolConfig {
  const trimmed = (connectionString || '').trim();
  if (!trimmed) {
    throw new Error('Database connection string is empty.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new Error('Invalid PostgreSQL connection URL format.');
  }

  if (parsedUrl.protocol !== 'postgres:' && parsedUrl.protocol !== 'postgresql:') {
    throw new Error('Database URL must use postgres:// or postgresql:// protocol.');
  }

  const sslModeParam = (
    parsedUrl.searchParams.get('sslmode') ||
    env.PGSSLMODE ||
    ''
  )
    .trim()
    .toLowerCase();
  const sslParam = (parsedUrl.searchParams.get('ssl') || env.DATABASE_SSL || '')
    .trim()
    .toLowerCase();

  const requiresSsl =
    sslModeParam === 'require' ||
    sslModeParam === 'verify-ca' ||
    sslModeParam === 'verify-full' ||
    sslModeParam === 'prefer' ||
    sslParam === 'true' ||
    sslParam === '1' ||
    parsedUrl.hostname.endsWith('.neon.tech') ||
    parsedUrl.hostname.endsWith('.supabase.co');

  const strictVerifyCert =
    sslModeParam === 'verify-full' ||
    sslModeParam === 'verify-ca' ||
    env.PGSSL_REJECT_UNAUTHORIZED === 'true';

  const maxConnections = Math.max(
    1,
    Math.min(50, Number(env.PG_POOL_MAX) || DEFAULT_POOL_MAX)
  );
  const minConnections = Math.max(
    0,
    Math.min(maxConnections, Number(env.PG_POOL_MIN) || DEFAULT_POOL_MIN)
  );
  const idleTimeoutMillis = Math.max(
    1_000,
    Number(env.PG_IDLE_TIMEOUT_MS) || DEFAULT_IDLE_TIMEOUT_MS
  );
  const connectionTimeoutMillis = Math.max(
    1_000,
    Number(env.PG_CONNECT_TIMEOUT_MS) || DEFAULT_CONNECTION_TIMEOUT_MS
  );

  // Strip sslmode from connectionString if we supply an explicit `ssl` object so pg-connection-string
  // does not override our `ssl` settings.
  const normalizedUrl = new URL(parsedUrl.toString());
  if (requiresSsl) {
    normalizedUrl.searchParams.delete('sslmode');
    normalizedUrl.searchParams.delete('ssl');
  }

  const config: PoolConfig = {
    connectionString: normalizedUrl.toString(),
    max: maxConnections,
    min: minConnections,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    allowExitOnIdle: true,
    application_name: 'therapist_psychologist_today_app',
  };

  if (requiresSsl) {
    config.ssl = {
      rejectUnauthorized: strictVerifyCert,
    };
  }

  return config;
}

let sharedAppPool: Pool | null = null;

/**
 * Returns a singleton connection pool for the restricted application role (`DATABASE_URL`).
 */
export function getSharedPostgresPool(
  env: Record<string, string | undefined> = process.env
): Pool {
  if (sharedAppPool) {
    return sharedAppPool;
  }

  const connectionString = (env.DATABASE_URL || '').trim();
  if (!connectionString) {
    throw new Error('Cannot initialize PostgreSQL pool: DATABASE_URL is not set.');
  }

  const poolConfig = buildPgPoolConfig(connectionString, env);
  const pool = new Pool(poolConfig);

  pool.on('error', (err) => {
    // Log only sanitized error message; never log DATABASE_URL, credentials, or SQL parameters
    console.error('[PostgresPool] Idle client error:', sanitizeDatabaseError(err));
  });

  sharedAppPool = pool;
  return sharedAppPool;
}

/**
 * Creates a dedicated connection pool for migration/seed scripts using `DATABASE_MIGRATION_URL`
 * (owner/migration role) or an explicitly passed URL.
 */
export function createMigrationPostgresPool(
  migrationConnectionString: string,
  env: Record<string, string | undefined> = process.env
): Pool {
  const poolConfig = buildPgPoolConfig(migrationConnectionString, env);
  const pool = new Pool({
    ...poolConfig,
    max: 4,
    application_name: 'therapist_psychologist_today_migrator',
  });

  pool.on('error', (err) => {
    console.error('[MigrationPool] Client error:', sanitizeDatabaseError(err));
  });

  return pool;
}
