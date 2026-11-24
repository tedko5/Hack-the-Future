import { count, sql } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { pings } from '#/db/schema.ts'

export type Health =
  | { ok: true; serverTime: string; pings: number; latencyMs: number }
  | { ok: false; error: string }

export async function checkHealth(): Promise<Health> {
  if (!process.env.DATABASE_URL) return { ok: false, error: 'DATABASE_URL is not set' }
  const start = performance.now()
  try {
    const [row] = await db.select({ now: sql<string>`now()::text`, pings: count() }).from(pings)
    return {
      ok: true,
      serverTime: row.now,
      pings: row.pings,
      latencyMs: Math.round(performance.now() - start),
    }
  } catch (error) {
    // Details stay in the server log; they can contain connection info.
    console.error('Health check failed:', error)
    return { ok: false, error: 'Database query failed, see the server log' }
  }
}

export async function createPing() {
  await db.insert(pings).values({})
}
