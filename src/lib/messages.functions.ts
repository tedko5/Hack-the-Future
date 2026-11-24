import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { conversationSchema, markReadSchema, sendMessageSchema } from '#/lib/message.ts'
import { validate } from '#/lib/validate.ts'
import { guardianMiddleware } from '#/middleware/auth.ts'
import * as messages from '#/server/messages.server.ts'

// The reader is always context.guardian, so nobody can open someone else's conversation.

export const getUnreadCount = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(({ context }) => messages.countAllUnread(context.guardian.guardianId))

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

export const sendMessage = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(sendMessageSchema))
  .handler(async ({ data, context }) => {
    const { guardianId } = context.guardian
    await messages.requireConversation(guardianId, data.conversationId)
    await messages.createMessage(guardianId, data.conversationId, data.body)
  })

export const markRead = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(markReadSchema))
  .handler(async ({ data, context }) => {
    const { guardianId } = context.guardian
    await messages.requireConversation(guardianId, data.conversationId)
    await messages.markRead(guardianId, data.conversationId, data.messageId)
  })
