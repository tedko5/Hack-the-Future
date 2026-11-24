import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import type { GlitchDetails } from '#/lib/echo.ts'
import { assignGlitchSchema, getGlitchSchema, setGlitchStatusSchema } from '#/lib/glitch.ts'
import { validate } from '#/lib/validate.ts'
import { commanderMiddleware, guardianMiddleware } from '#/middleware/auth.ts'
import { listEchoes } from '#/server/echoes.server.ts'
import { findGlitch, listGlitches, updateGlitch } from '#/server/glitches.server.ts'
import { findGuardian } from '#/server/guardians.server.ts'

export const getGlitches = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(() => listGlitches())

export const getGlitch = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .validator(validate(getGlitchSchema))
  .handler(async ({ data }): Promise<GlitchDetails> => {
    const glitch = await findGlitch(data.glitchId)
    if (!glitch) throw notFound()
    return { ...glitch, echoes: await listEchoes(data.glitchId) }
  })

export const setGlitchStatus = createServerFn({ method: 'POST' })
  .middleware([commanderMiddleware])
  .validator(validate(setGlitchStatusSchema))
  .handler(({ data }) => updateGlitch(data.glitchId, { status: data.status }))

/** Assign a glitch to a defender, or pass null to unassign it. */
export const assignGlitch = createServerFn({ method: 'POST' })
  .middleware([commanderMiddleware])
  .validator(validate(assignGlitchSchema))
  .handler(async ({ data }) => {
    if (data.guardianId !== null) {
      const assignee = await findGuardian(data.guardianId)
      if (assignee?.role !== 'defender') throw new Error('Choose a defender')
    }
    await updateGlitch(data.glitchId, { assignedGuardianId: data.guardianId })
  })
