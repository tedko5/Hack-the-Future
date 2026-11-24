import { createServerFn } from '@tanstack/react-start'
import { guardianMiddleware } from '#/middleware/auth.ts'
import { loadDashboard } from '#/server/dashboard.server.ts'
import { listLeaderboard } from '#/server/leaderboard.server.ts'

/** Everything in the report to the High Council, at one moment. */
export const getReport = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(async ({ context }) => {
    const [dashboard, leaderboard] = await Promise.all([
      loadDashboard(context.guardian),
      listLeaderboard(),
    ])
    return { ...dashboard, leaderboard, createdAt: new Date().toISOString() }
  })
