import { createServerFn } from '@tanstack/react-start'
import { guardianMiddleware } from '#/middleware/auth.ts'
import { loadDashboard } from '#/server/dashboard.server.ts'

export const getDashboard = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(({ context }) => loadDashboard(context.guardian))
