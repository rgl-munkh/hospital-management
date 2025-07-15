import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.POOLED_DATABASE_URL || process.env.POSTGRES_URL,
});

export const db = drizzle(pool, { schema }); 