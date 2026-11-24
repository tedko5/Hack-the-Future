import { createServerFn } from '@tanstack/react-start'
import { guardianMiddleware } from '#/middleware/auth.ts'
import { listLeaderboard } from '#/server/leaderboard.server.ts'

export const getLeaderboard = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(() => listLeaderboard())
