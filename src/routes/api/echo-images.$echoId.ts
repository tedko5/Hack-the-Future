import { createFileRoute } from '@tanstack/react-router'
import { findEchoImage } from '#/server/echoes.server.ts'
import { serveImage } from '#/server/images.server.ts'

/** The image of an echo, for every guardian. */
export const Route = createFileRoute('/api/echo-images/$echoId')({
  server: {
    handlers: {
      GET: ({ params }) => serveImage(params.echoId, (_, echoId) => findEchoImage(echoId)),
    },
  },
})
