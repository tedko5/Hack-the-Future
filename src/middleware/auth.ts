import { auth } from '@clerk/tanstack-react-start/server'
import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { findGuardian } from '#/server/guardians.server.ts'

// Anyone can call a server function directly, so every one that reads or writes data
// uses one of these. Route guards only decide what to show.

/** Signed in with Clerk. Adds `context.userId`. */
export const userMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated || !userId) throw redirect({ to: '/sign-in/$' })
  return next({ context: { userId } })
})

/** Registered with a codename. Adds `context.guardian`, read fresh so role changes apply at once. */
export const guardianMiddleware = createMiddleware({ type: 'function' })
  .middleware([userMiddleware])
  .server(async ({ next, context }) => {
    const guardian = await findGuardian(context.userId)
    if (!guardian) throw redirect({ to: '/welcome' })
    return next({ context: { guardian } })
  })

/** A guardian with the commander role. */
export const commanderMiddleware = createMiddleware({ type: 'function' })
  .middleware([guardianMiddleware])
  .server(async ({ next, context }) => {
    if (context.guardian.role !== 'commander') {
      setResponseStatus(403)
      throw new Error('Only commanders can do this')
    }
    return next()
  })
