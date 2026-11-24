import { createServerFn } from '@tanstack/react-start'
import { reportEchoSchema } from '#/lib/echo.ts'
import { validate } from '#/lib/validate.ts'
import { guardianMiddleware } from '#/middleware/auth.ts'
import { createEcho } from '#/server/echoes.server.ts'
import { readImage } from '#/server/images.server.ts'

/**
 * Without a glitchId this opens a new glitch; with one it adds an update to that
 * glitch, which may also change its status. The time and the reporter are set by the server.
 */
export const reportEcho = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator((form: FormData) => validate(reportEchoSchema)(form))
  .handler(async ({ data, context }) =>
    createEcho({
      ...data,
      image: data.image && (await readImage(data.image)),
      reporter: context.guardian,
    }),
  )
