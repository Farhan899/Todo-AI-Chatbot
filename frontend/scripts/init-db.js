const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Better Auth schema for PostgreSQL
const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  name TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  image TEXT
);

-- Sessions table
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  token TEXT NOT NULL UNIQUE,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "expiresAt" TIMESTAMP,
  password TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_session_userId" ON session("userId");
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON account("userId");
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
`;

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log('Initializing Better Auth database schema...');

    await client.query(createTablesSQL);

    console.log('✓ Database schema initialized successfully!');
  } catch (error) {
    console.error('✗ Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase().catch(error => {
  console.error(error);
  process.exit(1);
});
