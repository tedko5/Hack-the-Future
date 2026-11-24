import { auth } from '@clerk/tanstack-react-start/server'
import { createFileRoute } from '@tanstack/react-router'
import { findGuardian } from '#/server/guardians.server.ts'
import { findImage } from '#/server/messages.server.ts'

/** The image of a message, only for guardians who may see that message. */
export const Route = createFileRoute('/api/message-images/$messageId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { isAuthenticated, userId } = await auth()
        if (!isAuthenticated || !userId) return new Response('Unauthorized', { status: 401 })
        if (!/^[1-9]\d{0,8}$/.test(params.messageId)) return new Response('Not found', { status: 404 })
        try {
          const guardian = await findGuardian(userId)
          if (!guardian) return new Response('Forbidden', { status: 403 })
          const image = await findImage(guardian.guardianId, Number(params.messageId))
          if (!image) return new Response('Not found', { status: 404 })

          return new Response(new Uint8Array(image.data), {
            headers: {
              'Content-Type': image.type,
              'Cache-Control': 'private, max-age=3600',
              // Never let the browser treat an upload as anything but an image.
              'X-Content-Type-Options': 'nosniff',
              'Content-Security-Policy': "default-src 'none'; sandbox",
            },
          })
        } catch (error) {
          console.error(error)
          return new Response('Unavailable', { status: 503 })
        }
      },
    },
  },
})
