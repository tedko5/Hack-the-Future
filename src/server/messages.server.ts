import { and, desc, eq, gt, ilike, inArray, isNull, ne, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '#/db/index.ts'
import {
  conversationReads,
  guardians,
  messageImages,
  messageReactions,
  messages,
} from '#/db/schema.ts'
import {
  EVERYONE,
  REACTIONS,
  type Conversation,
  type Message,
  type MessageQuote,
  type Reaction,
  type ReactionEmoji,
} from '#/lib/message.ts'
import { getAvatars } from '#/server/avatars.server.ts'
import { findGuardian, listGuardians } from '#/server/guardians.server.ts'
import { detectImageType } from '#/server/imageType.server.ts'

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

/** Only when the guardian is a participant, or it was sent to everyone. */
function visibleTo(guardianId: string) {
  return or(
    isNull(messages.recipientId),
    eq(messages.recipientId, guardianId),
    eq(messages.senderId, guardianId),
  )
}

const quoted = alias(messages, 'quoted')
const quotedSender = alias(guardians, 'quoted_sender')

/** Every word must appear in the text. Wildcards in the query are taken literally. */
function containsWords(query: string) {
  return and(
    ...query
      .split(/\s+/)
      .map((word) => ilike(messages.body, `%${word.replace(/[\\%_]/g, '\\$&')}%`)),
  )
}

/** The latest messages, optionally only those matching a search, oldest first. */
export async function listMessages(
  guardianId: string,
  conversationId: string,
  query?: string,
): Promise<Message[]> {
  const rows = await db
    .select({
      messageId: messages.messageId,
      senderId: messages.senderId,
      senderCodename: guardians.codename,
      body: messages.body,
      hasImage: sql<boolean>`${messageImages.messageId} is not null`,
      createdAt: messages.createdAt,
      replyTo: {
        messageId: quoted.messageId,
        senderCodename: quotedSender.codename,
        body: quoted.body,
      },
    })
    .from(messages)
    .innerJoin(guardians, eq(guardians.guardianId, messages.senderId))
    .leftJoin(messageImages, eq(messageImages.messageId, messages.messageId))
    .leftJoin(quoted, eq(quoted.messageId, messages.replyToId))
    .leftJoin(quotedSender, eq(quotedSender.guardianId, quoted.senderId))
    .where(and(inConversation(guardianId, conversationId), query ? containsWords(query) : undefined))
    .orderBy(desc(messages.messageId))
    .limit(PAGE_SIZE)

  const reactions = await listReactions(
    guardianId,
    rows.map((row) => row.messageId),
  )
  return rows.reverse().map(({ replyTo, createdAt, ...row }) => ({
    ...row,
    createdAt: createdAt.toISOString(),
    // The joins fill every field with null when there is no quoted message.
    replyTo: replyTo.messageId === null ? null : (replyTo as MessageQuote),
    reactions: reactions.get(row.messageId) ?? [],
  }))
}

async function listReactions(guardianId: string, messageIds: number[]) {
  const byMessage = new Map<number, Reaction[]>()
  if (messageIds.length === 0) return byMessage

  const rows = await db
    .select({
      messageId: messageReactions.messageId,
      emoji: messageReactions.emoji,
      guardianId: messageReactions.guardianId,
      codename: guardians.codename,
    })
    .from(messageReactions)
    .innerJoin(guardians, eq(guardians.guardianId, messageReactions.guardianId))
    .where(inArray(messageReactions.messageId, messageIds))
    .orderBy(guardians.codename)

  for (const emoji of REACTIONS) {
    for (const row of rows.filter((candidate) => candidate.emoji === emoji)) {
      const reactions = byMessage.get(row.messageId) ?? []
      byMessage.set(row.messageId, reactions)
      let reaction = reactions.find((candidate) => candidate.emoji === emoji)
      if (!reaction) reactions.push((reaction = { emoji, codenames: [], isMine: false }))
      reaction.codenames.push(row.codename)
      if (row.guardianId === guardianId) reaction.isMine = true
    }
  }
  return byMessage
}

type NewMessage = {
  senderId: string
  conversationId: string
  body: string
  replyToId?: number
  image?: Buffer
}

export async function createMessage(message: NewMessage) {
  const { senderId, conversationId, body, replyToId, image } = message
  const type = image && detectImageType(image)
  if (image && !type) throw new Error('Use a JPEG, PNG, WebP or GIF image')

  if (replyToId !== undefined) {
    // Within the same conversation, so a reply never quotes a message its readers cannot see.
    const [target] = await db
      .select({ messageId: messages.messageId })
      .from(messages)
      .where(and(eq(messages.messageId, replyToId), inConversation(senderId, conversationId)))
    if (!target) throw new Error('The message you reply to does not exist')
  }

  await db.transaction(async (tx) => {
    const recipientId = conversationId === EVERYONE ? null : conversationId
    const [{ messageId }] = await tx
      .insert(messages)
      .values({ senderId, recipientId, body, replyToId })
      .returning({ messageId: messages.messageId })
    if (image && type) await tx.insert(messageImages).values({ messageId, type, data: image })
  })
}

export async function toggleReaction(guardianId: string, messageId: number, emoji: ReactionEmoji) {
  const [message] = await db
    .select({ messageId: messages.messageId })
    .from(messages)
    .where(and(eq(messages.messageId, messageId), visibleTo(guardianId)))
  if (!message) throw new Error('That message does not exist')

  const removed = await db
    .delete(messageReactions)
    .where(
      and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.guardianId, guardianId),
        eq(messageReactions.emoji, emoji),
      ),
    )
    .returning({ messageId: messageReactions.messageId })
  if (removed.length > 0) return
  await db
    .insert(messageReactions)
    .values({ messageId, guardianId, emoji })
    .onConflictDoNothing()
}

export async function findImage(guardianId: string, messageId: number) {
  const [image] = await db
    .select({ type: messageImages.type, data: messageImages.data })
    .from(messageImages)
    .innerJoin(messages, eq(messages.messageId, messageImages.messageId))
    .where(and(eq(messageImages.messageId, messageId), visibleTo(guardianId)))
  return image
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
  const [unread, guardianList] = await Promise.all([countUnread(guardianId), listGuardians()])
  const others = guardianList.filter((other) => other.guardianId !== guardianId)
  const avatars = await getAvatars(others.map((other) => other.guardianId))
  return [
    { conversationId: EVERYONE, title: 'All guardians', imageUrl: null },
    ...others.map((other) => ({
      conversationId: other.guardianId,
      title: other.codename,
      imageUrl: avatars.get(other.guardianId) ?? null,
    })),
  ].map((conversation) => ({
    ...conversation,
    unread: unread.get(conversation.conversationId) ?? 0,
  }))
}
