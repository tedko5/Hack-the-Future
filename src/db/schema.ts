import { sql } from 'drizzle-orm'
import { index, integer, pgSequence, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
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
    /** The glitch's status right after this echo. Null only for rows added by hand. */
    status: text('status', { enum: GLITCH_STATUSES }),
    /** The status this echo gave the glitch, or null if it left it alone. */
    newStatus: text('new_status', { enum: GLITCH_STATUSES }),
    reportingGuardianId: text('reporting_guardian_id').notNull().references(() => guardians.guardianId),
  },
  (table) => [index('echoes_glitch_id').on(table.glitchId)],
)

export const messages = pgTable(
  'messages',
  {
    messageId: serial('message_id').primaryKey(),
    senderId: text('sender_id').notNull().references(() => guardians.guardianId),
    /** Null for messages to everyone. */
    recipientId: text('recipient_id').references(() => guardians.guardianId),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('messages_participants').on(table.recipientId, table.senderId, table.messageId)],
)

/** How far a guardian has read each conversation. */
export const conversationReads = pgTable(
  'conversation_reads',
  {
    guardianId: text('guardian_id').notNull().references(() => guardians.guardianId),
    /** EVERYONE, or the other guardian's ID. */
    conversationId: text('conversation_id').notNull(),
    lastReadMessageId: integer('last_read_message_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.guardianId, table.conversationId] })],
)
