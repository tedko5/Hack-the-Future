import { sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
  customType,
  index,
  integer,
  pgSequence,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
// Relative import: drizzle-kit loads this file and doesn't resolve the `#/` alias.
import { GLITCH_STATUSES } from '../lib/glitch.ts'
import { GUARDIAN_ROLES } from '../lib/guardian.ts'
import { IMAGE_TYPES } from '../lib/image.ts'
import { REACTIONS } from '../lib/message.ts'
import { NOTIFICATION_TYPES } from '../lib/notification.ts'

const bytea = customType<{ data: Buffer }>({ dataType: () => 'bytea' })

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
    editedAt: timestamp('edited_at', { withTimezone: true }),
    reportingGuardianId: text('reporting_guardian_id').notNull().references(() => guardians.guardianId),
  },
  (table) => [index('echoes_glitch_id').on(table.glitchId)],
)

/** Kept apart from echoes, so listing them never loads the bytes. */
export const echoImages = pgTable('echo_images', {
  echoId: integer('echo_id').primaryKey().references(() => echoes.echoId),
  type: text('type', { enum: IMAGE_TYPES }).notNull(),
  data: bytea('data').notNull(),
})

export const messages = pgTable(
  'messages',
  {
    messageId: serial('message_id').primaryKey(),
    senderId: text('sender_id').notNull().references(() => guardians.guardianId),
    /** Null for messages to everyone. */
    recipientId: text('recipient_id').references(() => guardians.guardianId),
    /** Empty when the message is only an image. */
    body: text('body').notNull(),
    /** Set when its author deleted it. The text, image and reactions are gone by then. */
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    replyToId: integer('reply_to_id').references((): AnyPgColumn => messages.messageId),
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

/** Kept apart from messages, so listing a conversation never loads the bytes. */
export const messageImages = pgTable('message_images', {
  messageId: integer('message_id').primaryKey().references(() => messages.messageId),
  type: text('type', { enum: IMAGE_TYPES }).notNull(),
  data: bytea('data').notNull(),
})

export const messageReactions = pgTable(
  'message_reactions',
  {
    messageId: integer('message_id').notNull().references(() => messages.messageId),
    guardianId: text('guardian_id').notNull().references(() => guardians.guardianId),
    emoji: text('emoji', { enum: REACTIONS }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.messageId, table.guardianId, table.emoji] })],
)

export const notifications = pgTable(
  'notifications',
  {
    notificationId: serial('notification_id').primaryKey(),
    /** Who receives it. */
    guardianId: text('guardian_id').notNull().references(() => guardians.guardianId),
    actorId: text('actor_id').notNull().references(() => guardians.guardianId),
    type: text('type', { enum: NOTIFICATION_TYPES }).notNull(),
    glitchId: text('glitch_id').references(() => glitches.glitchId),
    messageId: integer('message_id').references(() => messages.messageId),
    /** The conversation as the recipient opens it. */
    conversationId: text('conversation_id'),
    /** The new status, the new role or the reaction, depending on the type. */
    detail: text('detail'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    readAt: timestamp('read_at', { withTimezone: true }),
  },
  (table) => [index('notifications_guardian').on(table.guardianId, table.notificationId)],
)
