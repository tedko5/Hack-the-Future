import { asc, eq } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { guardians } from '#/db/schema.ts'
import type { Guardian, GuardianRole } from '#/lib/guardian.ts'

const selectGuardians = () =>
  db
    .select({
      guardianId: guardians.guardianId,
      codename: guardians.codename,
      role: guardians.role,
    })
    .from(guardians)

export async function findGuardian(guardianId: string): Promise<Guardian | undefined> {
  const [guardian] = await selectGuardians().where(eq(guardians.guardianId, guardianId))
  return guardian
}

export function listGuardians(): Promise<Guardian[]> {
  return selectGuardians().orderBy(asc(guardians.codename))
}

/** Registering twice is harmless. The role is always the column default, defender. */
export async function createGuardian(guardianId: string, codename: string) {
  const [created] = await db
    .insert(guardians)
    .values({ guardianId, codename })
    .onConflictDoNothing()
    .returning({ guardianId: guardians.guardianId })
  if (!created && !(await findGuardian(guardianId))) throw new Error('That codename is taken')
}

export async function updateGuardianRole(guardianId: string, role: GuardianRole) {
  await db.update(guardians).set({ role }).where(eq(guardians.guardianId, guardianId))
}
