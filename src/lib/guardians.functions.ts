import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { guardians } from '#/db/schema.ts'
import { GUARDIAN_ROLES, type Guardian, type GuardianRole } from '#/lib/guardian.ts'
import { findGuardian, requireCommander, requireGuardian, requireUserId } from '#/lib/guardian.server.ts'

export const getCurrentGuardian = createServerFn({ method: 'GET' }).handler(
  (): Promise<Guardian> => requireGuardian(),
)

/** For the welcome page: signed in, but without a codename yet. */
export const requireNewcomer = createServerFn({ method: 'GET' }).handler(async () => {
  if (await findGuardian(await requireUserId())) throw redirect({ to: '/' })
})

export const registerGuardian = createServerFn({ method: 'POST' })
  .validator((data: { codename: string }) => {
    const codename = String(data?.codename ?? '').trim()
    if (!/^[A-Za-z0-9 _-]{3,24}$/.test(codename)) {
      throw new Error('Use 3 to 24 letters, digits, spaces, - or _')
    }
    return { codename }
  })
  .handler(async ({ data }) => {
    const guardianId = await requireUserId()
    // The role is never taken from the client: the column defaults to defender.
    const [created] = await db
      .insert(guardians)
      .values({ guardianId, codename: data.codename })
      .onConflictDoNothing()
      .returning({ guardianId: guardians.guardianId })
    if (!created && !(await findGuardian(guardianId))) {
      throw new Error('That codename is taken')
    }
  })

export const listGuardians = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Guardian[]> => {
    await requireCommander()
    return db
      .select({
        guardianId: guardians.guardianId,
        codename: guardians.codename,
        role: guardians.role,
      })
      .from(guardians)
      .orderBy(asc(guardians.codename))
  },
)

export const setGuardianRole = createServerFn({ method: 'POST' })
  .validator((data: { guardianId: string; role: GuardianRole }) => {
    const { guardianId, role } = data ?? {}
    if (typeof guardianId !== 'string' || !GUARDIAN_ROLES.includes(role)) {
      throw new Error('Invalid input')
    }
    return { guardianId, role }
  })
  .handler(async ({ data }) => {
    const commander = await requireCommander()
    // Prevents the last commander from locking everyone out.
    if (data.guardianId === commander.guardianId) {
      throw new Error('You cannot change your own role')
    }
    await db
      .update(guardians)
      .set({ role: data.role })
      .where(eq(guardians.guardianId, data.guardianId))
  })
