import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  conversationSchema,
  markReadSchema,
  messageRefSchema,
  searchMessagesSchema,
  sendMessageSchema,
  toggleReactionSchema,
} from '#/lib/message.ts'
import { validate } from '#/lib/validate.ts'
import { guardianMiddleware } from '#/middleware/auth.ts'
import { readImage } from '#/server/images.server.ts'
import * as messages from '#/server/messages.server.ts'
import { markConversationNotificationsRead } from '#/server/notifications/notifications.server.ts'

// The reader is always context.guardian, so nobody can open someone else's conversation.

/** All conversations, plus the messages of the open one. */
export const getConversation = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .validator(validate(conversationSchema))
  .handler(async ({ data, context }) => {
    const { guardianId } = context.guardian
    const conversations = await messages.listConversations(guardianId)
    const current = conversations.find(
      ({ conversationId }) => conversationId === data.conversationId,
    )
    if (!current) throw notFound()
    return {
      conversations,
      current,
      messages: await messages.listMessages(guardianId, data.conversationId),
    }
  })

/** Also finds messages older than the ones getConversation returns. POST keeps the text out of URLs. */
export const searchMessages = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(searchMessagesSchema))
  .handler(async ({ data, context }) => {
    const { guardianId } = context.guardian
    await messages.requireConversation(guardianId, data.conversationId)
    return messages.listMessages(guardianId, data.conversationId, data.query)
  })

export const sendMessage = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator((form: FormData) => validate(sendMessageSchema)(form))
  .handler(async ({ data, context }) => {
    const senderId = context.guardian.guardianId
    await messages.requireConversation(senderId, data.conversationId)
    const image = data.image && (await readImage(data.image))
    await messages.createMessage({ ...data, senderId, image })
  })

export const deleteMessage = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(messageRefSchema))
  .handler(({ data, context }) =>
    messages.deleteMessage(context.guardian.guardianId, data.messageId),
  )

export const toggleReaction = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(toggleReactionSchema))
  .handler(({ data, context }) =>
    messages.toggleReaction(context.guardian.guardianId, data.messageId, data.emoji),
  )

export const markRead = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(markReadSchema))
  .handler(async ({ data, context }) => {
    const { guardianId } = context.guardian
    await messages.requireConversation(guardianId, data.conversationId)
    await messages.markRead(guardianId, data.conversationId, data.messageId)
    await markConversationNotificationsRead(guardianId, data.conversationId)
  })
