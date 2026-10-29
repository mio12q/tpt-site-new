import crypto from 'node:crypto';
import readline from 'node:readline';
import {
  type PgQueryExecutor,
  createMigrationPostgresPool,
  sanitizeDatabaseError,
} from '../lib/db/postgres-pool';
import { PostgresPublicationRepository } from '../lib/repositories/postgres-publication-repository';
import {
  type CmsPersistentState,
  loadPersistentState,
} from '../lib/services/publication-service';
import { hashPassword } from '../lib/security';

/**
 * Prompts for a value on the terminal. When `maskInput` is true, characters are not echoed
 * to the terminal so the runtime admin password is never visible on screen or in logs.
 */
function promptRuntimeInput(promptLabel: string, maskInput: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: Boolean(process.stdin.isTTY),
    });

    if (maskInput && process.stdin.isTTY) {
      process.stdout.write(promptLabel);
      const origWrite = (rl as unknown as { _writeToOutput?: (s: string) => void })._writeToOutput;
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (
        stringToWrite: string
      ) => {
        if (stringToWrite.includes('\n') || stringToWrite.includes('\r')) {
          process.stdout.write('\n');
        }
      };
      rl.question('', (answer) => {
        if (origWrite) {
          (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = origWrite;
        }
        rl.close();
        resolve(answer);
      });
    } else {
      rl.question(promptLabel, (answer) => {
        rl.close();
        resolve(answer);
      });
    }

    rl.on('SIGINT', () => {
      rl.close();
      reject(new Error('Seed aborted by user.'));
    });
  });
}

export interface SeedDatabaseOptions {
  pool?: PgQueryExecutor;
  seedData?: CmsPersistentState;
  adminUsername?: string;
  adminDisplayName?: string;
  runtimeAdminPassword: string;
  totpEnabled?: boolean;
}

/**
 * Seeds PostgreSQL with the existing editorial data (sections, authors, articles, core pSEO pages)
 * and creates/updates the first admin user with a runtime-supplied password hashed via scrypt.
 * Never hard-codes or logs passwords, DATABASE_URL, or SQL bind parameters.
 */
export async function seedDatabaseAndCreateFirstAdmin(
  options: SeedDatabaseOptions
): Promise<{
  sectionsSeeded: number;
  authorsSeeded: number;
  articlesSeeded: number;
  pseoPagesSeeded: number;
  adminUsername: string;
}> {
  const runtimePassword = options.runtimeAdminPassword;
  if (!runtimePassword || runtimePassword.trim().length < 12) {
    throw new Error(
      'First admin password must be provided at runtime and be at least 12 characters long.'
    );
  }

  const migrationUrl = (
    process.env.DATABASE_MIGRATION_URL ||
    process.env.DATABASE_URL ||
    ''
  ).trim();

  if (!options.pool && !migrationUrl) {
    throw new Error(
      'Missing DATABASE_MIGRATION_URL (or DATABASE_URL). Provide the owner/migration connection string to run the seed script.'
    );
  }

  const pool = options.pool || createMigrationPostgresPool(migrationUrl);
  const state = options.seedData || loadPersistentState();
  const repo = new PostgresPublicationRepository(pool, state);

  try {
    // 1. Seed Sections first (referenced by articles)
    for (const section of state.sections) {
      await repo.upsertSectionInDb(section);
    }

    // 2. Seed Authors & Medical Reviewers (referenced by articles)
    for (const author of state.authors) {
      await repo.upsertAuthorInDb(author);
    }

    // 3. Seed Articles
    for (const article of state.articles) {
      await repo.upsertArticleInDb(article);
    }

    // 4. Seed Core pSEO Pages
    for (const page of state.corePseoPages) {
      await repo.upsertCorePseoPageInDb(page);
    }

    // 5. Create or update the first Admin user with a scrypt password hash
    const adminUsername = (options.adminUsername || 'admin').trim();
    const adminDisplayName = (
      options.adminDisplayName || '[Admin Name], [Credentials]'
    ).trim();
    const passwordHash = hashPassword(runtimePassword);

    await repo.upsertAdminUserInDb({
      id: `usr-admin-${crypto.randomBytes(6).toString('hex')}`,
      username: adminUsername,
      displayName: adminDisplayName,
      role: 'admin',
      passwordHash,
      totpEnabled: options.totpEnabled ?? false,
    });

    return {
      sectionsSeeded: state.sections.length,
      authorsSeeded: state.authors.length,
      articlesSeeded: state.articles.length,
      pseoPagesSeeded: state.corePseoPages.length,
      adminUsername,
    };
  } finally {
    if (!options.pool && pool.end) {
      await pool.end();
    }
  }
}

async function runCliSeed(): Promise<void> {
  const usernameArg =
    process.env.ADMIN_INITIAL_USERNAME ||
    (await promptRuntimeInput('Enter initial admin username [default: admin]: ')).trim() ||
    'admin';

  const displayNameArg =
    process.env.ADMIN_INITIAL_DISPLAY_NAME ||
    (
      await promptRuntimeInput(
        'Enter initial admin display name [default: [Admin Name], [Credentials]]: '
      )
    ).trim() ||
    '[Admin Name], [Credentials]';

  const runtimePassword =
    process.env.ADMIN_INITIAL_PASSWORD ||
    (await promptRuntimeInput(
      'Enter initial admin password (min 12 chars, input hidden): ',
      true
    ));

  const result = await seedDatabaseAndCreateFirstAdmin({
    adminUsername: usernameArg,
    adminDisplayName: displayNameArg,
    runtimeAdminPassword: runtimePassword,
  });

  console.log(
    `[db:seed] Seeded ${result.sectionsSeeded} sections, ${result.authorsSeeded} authors, ${result.articlesSeeded} articles, ${result.pseoPagesSeeded} pSEO pages, and created/updated admin user "${result.adminUsername}" (scrypt hash stored).`
  );
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith('db-seed.ts');

if (isDirectExecution) {
  runCliSeed().catch((err) => {
    console.error('[db:seed] Seed failed:', sanitizeDatabaseError(err));
    process.exit(1);
  });
}
