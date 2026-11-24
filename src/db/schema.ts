import { sql } from 'drizzle-orm'
import { index, pgSequence, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
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
  /** The defender working on it, if any. */
  assignedGuardianId: text('assigned_guardian_id').references(() => guardians.guardianId),
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

/** Numbers new glitches. Starts after the sample data (GL-0142). */
export const glitchNumber = pgSequence('glitch_number', { startWith: 143 })

export const echoes = pgTable(
  'echoes',
  {
    echoId: serial('echo_id').primaryKey(),
    glitchId: text('glitch_id').notNull().references(() => glitches.glitchId),
    description: text('description').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    reportingGuardianId: text('reporting_guardian_id').notNull().references(() => guardians.guardianId),
  },
  (table) => [index('echoes_glitch_id').on(table.glitchId)],
)
