import { createServerFn } from '@tanstack/react-start'
import { guardianMiddleware } from '#/middleware/auth.ts'
import { checkHealth, createPing } from '#/server/health.server.ts'

export const getHealth = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(() => checkHealth())

export const addPing = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .handler(() => createPing())
