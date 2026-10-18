import { neon, neonConfig } from '@neondatabase/serverless';

// Cache connections where possible
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL || '';

export const sql = connectionString ? neon(connectionString) : null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Please provide your Neon connection string in .env.local');
  }
  return neon(process.env.DATABASE_URL);
}
