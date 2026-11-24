import { sql } from 'drizzle-orm'
import { pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
// Relative import: drizzle-kit loads this file and doesn't resolve the `#/` alias.
import { GLITCH_STATUSES } from '../lib/glitch.ts'
import { GUARDIAN_ROLES } from '../lib/guardian.ts'

// Throwaway table that proves migrations and writes work.
export const pings = pgTable('pings', {
  id: serial().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const glitches = pgTable('glitches', {
  glitchId: text('glitch_id').primaryKey(),
  status: text('status', { enum: GLITCH_STATUSES }).notNull(),
  description: text('description').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
})

export const guardians = pgTable(
  'guardians',
  {
    /** Clerk user ID */
    guardianId: text('guardian_id').primaryKey(),
    codename: text('codename').notNull(),
    role: text('role', { enum: GUARDIAN_ROLES }).notNull().default('defender'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('guardians_codename_lower').on(sql`lower(${table.codename})`)],
)
