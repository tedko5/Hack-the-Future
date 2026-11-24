import { createServerFn } from '@tanstack/react-start'
import { echoRefSchema, editEchoSchema, reportEchoSchema } from '#/lib/schemas/echo.ts'
import { validate } from './validate.ts'
import { commanderMiddleware, guardianMiddleware } from '#/middleware/auth.ts'
import * as echoes from '#/server/echoes.server.ts'
import { readImage } from '#/server/images.server.ts'

/**
 * Without a glitchId this opens a new glitch; with one it adds an update to that
 * glitch, which may also change its status. The time and the reporter are set by the server.
 */
export const reportEcho = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator((form: FormData) => validate(reportEchoSchema)(form))
  .handler(async ({ data, context }) =>
    echoes.createEcho({
      ...data,
      image: data.image && (await readImage(data.image)),
      reporter: context.guardian,
    }),
  )

export const editEcho = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(editEchoSchema))
  .handler(({ data, context }) => echoes.editEcho(context.guardian, data.echoId, data.description))

export const removeEcho = createServerFn({ method: 'POST' })
  .middleware([commanderMiddleware])
  .validator(validate(echoRefSchema))
  .handler(({ data }) => echoes.removeEcho(data.echoId))
