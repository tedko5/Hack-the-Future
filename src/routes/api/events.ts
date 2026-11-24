import { auth } from '@clerk/tanstack-react-start/server'
import { createFileRoute } from '@tanstack/react-router'
import { findGuardian } from '#/server/guardians.server.ts'
import { createLiveEventStream } from '#/server/liveEvents.server.ts'

/** Server-sent events for signed-in guardians. Use it through useLiveEvents. */
export const Route = createFileRoute('/api/events')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { isAuthenticated, userId } = await auth()
        if (!isAuthenticated || !userId) return new Response('Unauthorized', { status: 401 })
        try {
          if (!(await findGuardian(userId))) return new Response('Forbidden', { status: 403 })
        } catch (error) {
          console.error(error)
          return new Response('Unavailable', { status: 503 })
        }

        return new Response(createLiveEventStream(userId, request.signal), {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
          },
        })
      },
    },
  },
})
