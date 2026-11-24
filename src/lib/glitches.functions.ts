import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import type { GlitchDetails } from '#/lib/echo.ts'
import { assignGlitchSchema, glitchRefSchema } from '#/lib/glitch.ts'
import { validate } from '#/lib/validate.ts'
import { commanderMiddleware, guardianMiddleware } from '#/middleware/auth.ts'
import { listGlitchEchoes } from '#/server/echoes.server.ts'
import * as glitches from '#/server/glitches.server.ts'
import { findGuardian } from '#/server/guardians.server.ts'

export const getGlitches = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(() => glitches.listGlitches())

export const getGlitch = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .validator(validate(glitchRefSchema))
  .handler(async ({ data }): Promise<GlitchDetails> => {
    const glitch = await glitches.findGlitch(data.glitchId)
    if (!glitch) throw notFound()
    return { ...glitch, echoes: await listGlitchEchoes(data.glitchId) }
  })

/** Assign a glitch to a defender, or pass null to unassign it. */
export const assignGlitch = createServerFn({ method: 'POST' })
  .middleware([commanderMiddleware])
  .validator(validate(assignGlitchSchema))
  .handler(async ({ data, context }) => {
    if (data.guardianId !== null) {
      const assignee = await findGuardian(data.guardianId)
      if (assignee?.role !== 'defender') throw new Error('Choose a defender')
    }
    await glitches.assignGlitch(data.glitchId, data.guardianId, context.guardian.guardianId)
  })

/** A defender assigns a free glitch to themselves. Commanders use assignGlitch. */
export const takeGlitch = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(glitchRefSchema))
  .handler(async ({ data, context }) => {
    if (context.guardian.role !== 'defender') throw new Error('Only defenders can take a glitch')
    await glitches.takeGlitch(data.glitchId, context.guardian.guardianId)
  })

export const releaseGlitch = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(glitchRefSchema))
  .handler(({ data, context }) =>
    glitches.releaseGlitch(data.glitchId, context.guardian.guardianId),
  )

/** One random attempt to fix the glitch. On failure it needs manual intervention. */
export const hackGlitch = createServerFn({ method: 'POST' })
  .middleware([commanderMiddleware])
  .validator(validate(glitchRefSchema))
  .handler(({ data, context }) => glitches.hackGlitch(data.glitchId, context.guardian))
