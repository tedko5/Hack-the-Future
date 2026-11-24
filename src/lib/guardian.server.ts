import { auth } from '@clerk/tanstack-react-start/server'
import { redirect } from '@tanstack/react-router'
import { setResponseStatus } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { guardians } from '#/db/schema.ts'
import type { Guardian } from '#/lib/guardian.ts'

// Server functions can be called directly by anyone, so every one that reads or
// writes data must start with one of these checks. Route guards are only for UX.

export async function requireUserId(): Promise<string> {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated || !userId) throw redirect({ to: '/sign-in/$' })
  return userId
}

export async function findGuardian(guardianId: string): Promise<Guardian | undefined> {
  const [guardian] = await db
    .select({
      guardianId: guardians.guardianId,
      codename: guardians.codename,
      role: guardians.role,
    })
    .from(guardians)
    .where(eq(guardians.guardianId, guardianId))
  return guardian
}

/** The role is read from Postgres on every call, so a change applies immediately. */
export async function requireGuardian(): Promise<Guardian> {
  const guardian = await findGuardian(await requireUserId())
  if (!guardian) throw redirect({ to: '/welcome' })
  return guardian
}

export async function requireCommander(): Promise<Guardian> {
  const guardian = await requireGuardian()
  if (guardian.role !== 'commander') {
    setResponseStatus(403)
    throw new Error('Only commanders can do this')
  }
  return guardian
}
