import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { registerGuardianSchema, setGuardianRoleSchema } from '#/lib/guardian.ts'
import { validate } from '#/lib/validate.ts'
import { commanderMiddleware, guardianMiddleware, userMiddleware } from '#/middleware/auth.ts'
import * as guardians from '#/server/guardians.server.ts'

export const getCurrentGuardian = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(({ context }) => context.guardian)

/** For the welcome page: signed in, but without a codename yet. */
export const requireNewcomer = createServerFn({ method: 'GET' })
  .middleware([userMiddleware])
  .handler(async ({ context }) => {
    if (await guardians.findGuardian(context.userId)) throw redirect({ to: '/' })
  })

export const registerGuardian = createServerFn({ method: 'POST' })
  .middleware([userMiddleware])
  .validator(validate(registerGuardianSchema))
  .handler(({ data, context }) => guardians.createGuardian(context.userId, data.codename))

export const listGuardians = createServerFn({ method: 'GET' })
  .middleware([commanderMiddleware])
  .handler(() => guardians.listGuardians())

export const setGuardianRole = createServerFn({ method: 'POST' })
  .middleware([commanderMiddleware])
  .validator(validate(setGuardianRoleSchema))
  .handler(async ({ data, context }) => {
    // Prevents the last commander from locking everyone out.
    if (data.guardianId === context.guardian.guardianId) {
      throw new Error('You cannot change your own role')
    }
    await guardians.updateGuardianRole(data.guardianId, data.role, context.guardian.guardianId)
  })
