import { and, desc, eq, gt, isNull, ne, or, sql } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { conversationReads, guardians, messages } from '#/db/schema.ts'
import { EVERYONE, type Conversation, type Message } from '#/lib/message.ts'
import { findGuardian, listGuardians } from '#/server/guardians.server.ts'

const PAGE_SIZE = 100

/**
 * The messages of one conversation as `guardianId` may see them. Every read goes through
 * this, so a private conversation always has the reader as one of its two participants.
 */
function inConversation(guardianId: string, conversationId: string) {
  if (conversationId === EVERYONE) return isNull(messages.recipientId)
  return or(
    and(eq(messages.senderId, guardianId), eq(messages.recipientId, conversationId)),
    and(eq(messages.senderId, conversationId), eq(messages.recipientId, guardianId)),
  )
}

/** Throws unless the conversation is with everyone or with another existing guardian. */
export async function requireConversation(guardianId: string, conversationId: string) {
  if (conversationId === EVERYONE) return
  if (conversationId === guardianId || !(await findGuardian(conversationId))) {
    throw new Error('That conversation does not exist')
  }
}

/** The latest messages, oldest first. */
export async function listMessages(guardianId: string, conversationId: string): Promise<Message[]> {
  const rows = await db
    .select({
      messageId: messages.messageId,
      senderId: messages.senderId,
      senderCodename: guardians.codename,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(guardians, eq(guardians.guardianId, messages.senderId))
    .where(inConversation(guardianId, conversationId))
    .orderBy(desc(messages.messageId))
    .limit(PAGE_SIZE)
  return rows.reverse().map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
}

export async function createMessage(senderId: string, conversationId: string, body: string) {
  const recipientId = conversationId === EVERYONE ? null : conversationId
  await db.insert(messages).values({ senderId, recipientId, body })
}

/** Never moves backwards, so an older tab cannot make messages unread again. */
export async function markRead(guardianId: string, conversationId: string, messageId: number) {
  await db
    .insert(conversationReads)
    .values({ guardianId, conversationId, lastReadMessageId: messageId })
    .onConflictDoUpdate({
      target: [conversationReads.guardianId, conversationReads.conversationId],
      set: {
        lastReadMessageId: sql`greatest(${conversationReads.lastReadMessageId}, excluded.last_read_message_id)`,
      },
    })
}

async function countUnread(guardianId: string): Promise<Map<string, number>> {
  // For incoming messages, the conversation is everyone or the sender.
  const conversationId = sql<string>`case when ${messages.recipientId} is null then ${EVERYONE}::text else ${messages.senderId} end`
  const rows = await db
    .select({ conversationId, unread: sql<number>`count(*)::int` })
    .from(messages)
    .leftJoin(
      conversationReads,
      and(
        eq(conversationReads.guardianId, guardianId),
        eq(conversationReads.conversationId, conversationId),
      ),
    )
    .where(
      and(
        ne(messages.senderId, guardianId),
        or(isNull(messages.recipientId), eq(messages.recipientId, guardianId)),
        gt(messages.messageId, sql`coalesce(${conversationReads.lastReadMessageId}, 0)`),
      ),
    )
    .groupBy(sql`1`)
  return new Map(rows.map((row) => [row.conversationId, row.unread]))
}

export async function countAllUnread(guardianId: string) {
  return [...(await countUnread(guardianId)).values()].reduce((total, unread) => total + unread, 0)
}

/** Everyone first, then one conversation per other guardian. */
export async function listConversations(guardianId: string): Promise<Conversation[]> {
  const [unread, others] = await Promise.all([countUnread(guardianId), listGuardians()])
  return [
    { conversationId: EVERYONE, title: 'All guardians' },
    ...others
      .filter((other) => other.guardianId !== guardianId)
      .map((other) => ({ conversationId: other.guardianId, title: other.codename })),
  ].map((conversation) => ({
    ...conversation,
    unread: unread.get(conversation.conversationId) ?? 0,
  }))
}
