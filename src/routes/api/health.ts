import { createFileRoute } from '@tanstack/react-router'
import { checkHealth } from '../../db/health'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        const health = await checkHealth()
        return Response.json(health, { status: health.ok ? 200 : 503 })
      },
    },
  },
})
