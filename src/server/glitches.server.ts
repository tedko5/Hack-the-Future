import { and, desc, eq, inArray, isNull, ne } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { echoImages, echoes, glitches, guardians, notifications } from '#/db/schema.ts'
import { dictionaries } from '#/i18n/index.ts'
import { getLanguage } from '#/i18n/currentLanguage.ts'
import { HACK_SUCCESS_CHANCE, type Glitch, type HackResult } from '#/lib/glitch.ts'
import type { Guardian } from '#/lib/guardian.ts'
import { writeEcho } from '#/server/echoes.server.ts'
import { listCommanderIds } from '#/server/guardians.server.ts'
import { withNotifications } from '#/server/notifications/notify.server.ts'

const selectGlitches = () =>
  db
    .select({
      glitchId: glitches.glitchId,
      status: glitches.status,
      description: glitches.description,
      timestamp: glitches.timestamp,
      assignedGuardianId: glitches.assignedGuardianId,
      assignedCodename: guardians.codename,
      hackResult: glitches.hackResult,
    })
    .from(glitches)
    .leftJoin(guardians, eq(guardians.guardianId, glitches.assignedGuardianId))

type GlitchRow = Awaited<ReturnType<typeof selectGlitches>>[number]

const toGlitch = (row: GlitchRow): Glitch => ({ ...row, timestamp: row.timestamp.toISOString() })

/** Newest first. */
export async function listGlitches(): Promise<Glitch[]> {
  return (await selectGlitches().orderBy(desc(glitches.timestamp))).map(toGlitch)
}

export async function findGlitch(glitchId: string): Promise<Glitch | undefined> {
  const [row] = await selectGlitches().where(eq(glitches.glitchId, glitchId))
  return row && toGlitch(row)
}

export function assignGlitch(glitchId: string, guardianId: string | null, actorId: string) {
  return withNotifications(async (tx, notify) => {
    const [glitch] = await tx
      .select({ assignedGuardianId: glitches.assignedGuardianId })
      .from(glitches)
      .where(eq(glitches.glitchId, glitchId))
      .for('update')
    if (!glitch) throw new Error('That glitch does not exist')
    const previousId = glitch.assignedGuardianId
    if (previousId === guardianId) return

    await tx
      .update(glitches)
      .set({ assignedGuardianId: guardianId })
      .where(eq(glitches.glitchId, glitchId))
    if (previousId) notify({ guardianId: previousId, actorId, type: 'glitch_unassigned', glitchId })
    if (guardianId) notify({ guardianId, actorId, type: 'glitch_assigned', glitchId })
  })
}

/** Checked in the update itself, so two defenders can never both take it. */
export async function takeGlitch(glitchId: string, guardianId: string) {
  const updated = await db
    .update(glitches)
    .set({ assignedGuardianId: guardianId })
    .where(and(eq(glitches.glitchId, glitchId), isNull(glitches.assignedGuardianId)))
    .returning({ glitchId: glitches.glitchId })
  if (updated.length === 0) throw new Error('That glitch is already assigned or does not exist')
}

/** Tells the commanders, because the glitch needs a new defender. */
export function releaseGlitch(glitchId: string, guardianId: string) {
  return withNotifications(async (tx, notify) => {
    const updated = await tx
      .update(glitches)
      .set({ assignedGuardianId: null })
      .where(and(eq(glitches.glitchId, glitchId), eq(glitches.assignedGuardianId, guardianId)))
      .returning({ glitchId: glitches.glitchId })
    if (updated.length === 0) throw new Error('That glitch is not assigned to you')
    for (const commanderId of await listCommanderIds(tx)) {
      notify({ guardianId: commanderId, actorId: guardianId, type: 'glitch_released', glitchId })
    }
  })
}

export async function editGlitch(glitchId: string, description: string) {
  const updated = await db
    .update(glitches)
    .set({ description })
    .where(eq(glitches.glitchId, glitchId))
    .returning({ glitchId: glitches.glitchId })
  if (updated.length === 0) throw new Error('That glitch does not exist')
}

/** For good, with everything that belongs to it. */
export async function removeGlitch(glitchId: string) {
  await db.transaction(async (tx) => {
    // Locked first, so no echo can be added while the rest is being removed.
    const [glitch] = await tx
      .select({ glitchId: glitches.glitchId })
      .from(glitches)
      .where(eq(glitches.glitchId, glitchId))
      .for('update')
    if (!glitch) throw new Error('That glitch does not exist')

    const echoIds = tx
      .select({ echoId: echoes.echoId })
      .from(echoes)
      .where(eq(echoes.glitchId, glitchId))
    await tx.delete(echoImages).where(inArray(echoImages.echoId, echoIds))
    await tx.delete(echoes).where(eq(echoes.glitchId, glitchId))
    await tx.delete(notifications).where(eq(notifications.glitchId, glitchId))
    await tx.delete(glitches).where(eq(glitches.glitchId, glitchId))
  })
}

/**
 * A commander's one attempt to fix a glitch from afar. The result is claimed in the update
 * itself, so two commanders can never both try, and it is logged as an echo.
 */
export function hackGlitch(glitchId: string, commander: Guardian) {
  return withNotifications(async (tx, notify) => {
    const result: HackResult = Math.random() < HACK_SUCCESS_CHANCE ? 'SUCCESS' : 'FAILED'
    const claimed = await tx
      .update(glitches)
      .set({ hackResult: result })
      .where(
        and(
          eq(glitches.glitchId, glitchId),
          isNull(glitches.hackResult),
          ne(glitches.status, 'FIXED'),
        ),
      )
      .returning({ glitchId: glitches.glitchId })
    if (claimed.length === 0) throw new Error('This glitch cannot be hacked anymore')

    await writeEcho(tx, notify, {
      glitchId,
      reporter: commander,
      description: dictionaries[getLanguage()].hack.echoes[result],
      status: result === 'SUCCESS' ? 'FIXED' : undefined,
    })
    return result
  })
}
