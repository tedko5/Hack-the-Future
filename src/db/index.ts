import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.ts'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Fail fast so the health check reports a dead database instead of hanging.
  connectionTimeoutMillis: 3000,
})

// Without a listener, a dropped idle connection would crash the server.
pool.on('error', (error) => console.error('Postgres pool error:', error.message))

export const db = drizzle(pool, { schema })
