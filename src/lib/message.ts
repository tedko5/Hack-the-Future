import { z } from 'zod'

/** The conversation all guardians share. Every other conversation ID is the other guardian's ID. */
export const EVERYONE = 'everyone'

export const MESSAGE_MAX_LENGTH = 1000

export type Message = {
  messageId: number
  senderId: string
  senderCodename: string
  body: string
  /** ISO 8601 */
  createdAt: string
}

export type Conversation = {
  conversationId: string
  title: string
  unread: number
}

const conversationIdSchema = z.string('Invalid conversation').min(1, 'Invalid conversation')

const bodyMessage = `Write 1 to ${MESSAGE_MAX_LENGTH} characters`

export const conversationSchema = z.object({ conversationId: conversationIdSchema })

export const sendMessageSchema = z.object({
  conversationId: conversationIdSchema,
  body: z.string(bodyMessage).trim().min(1, bodyMessage).max(MESSAGE_MAX_LENGTH, bodyMessage),
})

export const markReadSchema = z.object({
  conversationId: conversationIdSchema,
  messageId: z.int32('Invalid message').positive('Invalid message'),
})
