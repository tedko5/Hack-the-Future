import { createFileRoute } from '@tanstack/react-router'
import { serveImage } from '#/server/images.server.ts'
import { findImage } from '#/server/messages.server.ts'

/** The image of a message, only for guardians who may see that message. */
export const Route = createFileRoute('/api/message-images/$messageId')({
  server: {
    handlers: {
      GET: ({ params }) => serveImage(params.messageId, findImage),
    },
  },
})
