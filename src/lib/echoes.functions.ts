import { createServerFn } from '@tanstack/react-start'
import { reportEchoSchema } from '#/lib/echo.ts'
import { validate } from '#/lib/validate.ts'
import { guardianMiddleware } from '#/middleware/auth.ts'
import { createEcho } from '#/server/echoes.server.ts'

/**
 * Without a glitchId this opens a new glitch; with one it adds an update to that
 * glitch. The time and the reporter are set by the server.
 */
export const reportEcho = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(reportEchoSchema))
  .handler(({ data, context }) =>
    createEcho({ ...data, reportingGuardianId: context.guardian.guardianId }),
  )
