import { and, asc, eq, ne } from 'drizzle-orm'
import { db, type Transaction } from '#/db/index.ts'
import { guardians } from '#/db/schema.ts'
import type { Guardian, GuardianRole } from '#/lib/guardian.ts'
import { withNotifications } from '#/server/notifications/notify.server.ts'

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

export function updateGuardianRole(guardianId: string, role: GuardianRole, actorId: string) {
  return withNotifications(async (tx, notify) => {
    const updated = await tx
      .update(guardians)
      .set({ role })
      .where(and(eq(guardians.guardianId, guardianId), ne(guardians.role, role)))
      .returning({ guardianId: guardians.guardianId })
    if (updated.length > 0) notify({ guardianId, actorId, type: 'role_changed', detail: role })
  })
}

export async function listCommanderIds(tx: Transaction) {
  const rows = await tx
    .select({ guardianId: guardians.guardianId })
    .from(guardians)
    .where(eq(guardians.role, 'commander'))
  return rows.map((row) => row.guardianId)
}
