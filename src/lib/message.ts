import { z } from 'zod'

/** The conversation all guardians share. Every other conversation ID is the other guardian's ID. */
export const EVERYONE = 'everyone'

export const MESSAGE_MAX_LENGTH = 1000

export const REACTIONS = ['👍', '❤️', '😂', '😮', '🔥', '✅'] as const

export type ReactionEmoji = (typeof REACTIONS)[number]

/** SVG is left out on purpose: it can contain scripts. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

export type ImageType = (typeof IMAGE_TYPES)[number]

export const IMAGE_MAX_BYTES = 3 * 1024 * 1024

export type Reaction = {
  emoji: ReactionEmoji
  codenames: string[]
  /** Whether the reader is one of them. */
  isMine: boolean
}

export type MessageQuote = {
  messageId: number
  senderCodename: string
  body: string
}

export type Message = {
  messageId: number
  senderId: string
  senderCodename: string
  /** Empty when the message is only an image. */
  body: string
  hasImage: boolean
  /** ISO 8601 */
  createdAt: string
  replyTo: MessageQuote | null
  reactions: Reaction[]
}

export type Conversation = {
  conversationId: string
  title: string
  /** The other guardian's profile picture, if there is one. */
  imageUrl: string | null
  unread: number
}

/** The text that stands for a message in a quote. */
export function quoteText({ body }: Pick<MessageQuote, 'body'>) {
  return body || 'Image'
}

const conversationIdSchema = z.string('Invalid conversation').min(1, 'Invalid conversation')

const messageIdSchema = z.int32('Invalid message').positive('Invalid message')

export const conversationSchema = z.object({ conversationId: conversationIdSchema })

export const SEARCH_MAX_LENGTH = 100

export const searchMessagesSchema = z.object({
  conversationId: conversationIdSchema,
  query: z
    .string('Invalid search')
    .trim()
    .min(1, 'Invalid search')
    .max(SEARCH_MAX_LENGTH, `Search for up to ${SEARCH_MAX_LENGTH} characters`),
})

export const markReadSchema = z.object({
  conversationId: conversationIdSchema,
  messageId: messageIdSchema,
})

export const toggleReactionSchema = z.object({
  messageId: messageIdSchema,
  emoji: z.enum(REACTIONS, 'Invalid reaction'),
})

const bodyMessage = `Write 1 to ${MESSAGE_MAX_LENGTH} characters, or add an image`

/** Sent as a form, because it can carry an image. */
export const sendMessageSchema = z.preprocess(
  (form) =>
    form instanceof FormData
      ? {
          conversationId: form.get('conversationId'),
          body: form.get('body') ?? '',
          replyToId: form.has('replyToId') ? Number(form.get('replyToId')) : undefined,
          image: form.get('image') ?? undefined,
        }
      : form,
  z
    .object({
      conversationId: conversationIdSchema,
      body: z.string(bodyMessage).trim().max(MESSAGE_MAX_LENGTH, bodyMessage),
      replyToId: messageIdSchema.optional(),
      image: z.file('Invalid image').max(IMAGE_MAX_BYTES, 'Images can be up to 3 MB').optional(),
    })
    .refine(({ body, image }) => body !== '' || image, bodyMessage),
)
