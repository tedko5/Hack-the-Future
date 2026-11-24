import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import { db, type Transaction } from '#/db/index.ts'
import { echoImages, echoes, glitches, guardians } from '#/db/schema.ts'
import { canEditEcho, type Echo } from '#/lib/echo.ts'
import { canChangeStatus, type GlitchStatus } from '#/lib/glitch.ts'
import type { Guardian } from '#/lib/guardian.ts'
import { listCommanderIds } from '#/server/guardians.server.ts'
import type { StoredImage } from '#/server/images.server.ts'
import { withNotifications } from '#/server/notifications/notify.server.ts'

type NewEcho = {
  description: string
  reporter: Guardian
  /** Opens a new glitch when left out. */
  glitchId?: string
  /** Changes the status of the existing glitch. */
  status?: GlitchStatus
  image?: StoredImage
}

const selectEchoes = () =>
  db
    .select({
      echoId: echoes.echoId,
      description: echoes.description,
      timestamp: echoes.timestamp,
      status: sql<GlitchStatus>`coalesce(${echoes.status}, ${glitches.status})`,
      newStatus: echoes.newStatus,
      hasImage: sql<boolean>`${echoImages.echoId} is not null`,
      isEdited: sql<boolean>`${echoes.editedAt} is not null`,
      reporter: {
        guardianId: guardians.guardianId,
        codename: guardians.codename,
        role: guardians.role,
      },
      glitch: { glitchId: glitches.glitchId, status: glitches.status },
    })
    .from(echoes)
    .innerJoin(guardians, eq(guardians.guardianId, echoes.reportingGuardianId))
    .innerJoin(glitches, eq(glitches.glitchId, echoes.glitchId))
    .leftJoin(echoImages, eq(echoImages.echoId, echoes.echoId))

type EchoRow = Awaited<ReturnType<typeof selectEchoes>>[number]

const toEcho = (row: EchoRow): Echo => ({ ...row, timestamp: row.timestamp.toISOString() })

const newestFirst = [desc(echoes.timestamp), desc(echoes.echoId)]

export async function listEchoes(): Promise<Echo[]> {
  return (await selectEchoes().orderBy(...newestFirst)).map(toEcho)
}

export async function listGlitchEchoes(glitchId: string): Promise<Echo[]> {
  const rows = await selectEchoes()
    .where(eq(echoes.glitchId, glitchId))
    .orderBy(...newestFirst)
  return rows.map(toEcho)
}

/** A glitch that still has the text of the echo that opened it follows along. */
export async function editEcho(editor: Guardian, echoId: number, description: string) {
  await db.transaction(async (tx) => {
    const [echo] = await tx.select().from(echoes).where(eq(echoes.echoId, echoId)).for('update')
    if (!echo) throw new Error('That echo does not exist')
    if (!canEditEcho(editor, echo.reportingGuardianId)) {
      throw new Error('Only its author or a commander can edit an echo')
    }
    if (echo.description === description) return

    await tx
      .update(echoes)
      .set({ description, editedAt: sql`now()` })
      .where(eq(echoes.echoId, echoId))
    await tx
      .update(glitches)
      .set({ description })
      .where(
        and(
          eq(glitches.glitchId, echo.glitchId),
          eq(glitches.description, echo.description),
          eq(glitches.timestamp, echo.timestamp),
        ),
      )
  })
}

/** Never the last one: a glitch always has an echo, so then the glitch itself has to go. */
export async function removeEcho(echoId: number) {
  await db.transaction(async (tx) => {
    const [echo] = await tx
      .select({ glitchId: echoes.glitchId })
      .from(echoes)
      .where(eq(echoes.echoId, echoId))
    if (!echo) throw new Error('That echo does not exist')
    // Locked, so two commanders cannot remove the last two at the same time.
    await tx
      .select({ glitchId: glitches.glitchId })
      .from(glitches)
      .where(eq(glitches.glitchId, echo.glitchId))
      .for('update')
    const [{ total }] = await tx
      .select({ total: count() })
      .from(echoes)
      .where(eq(echoes.glitchId, echo.glitchId))
    if (total <= 1) throw new Error('This is the only echo, remove the glitch instead')

    await tx.delete(echoImages).where(eq(echoImages.echoId, echoId))
    await tx.delete(echoes).where(eq(echoes.echoId, echoId))
  })
}

export async function findEchoImage(echoId: number): Promise<StoredImage | undefined> {
  const [image] = await db
    .select({ type: echoImages.type, data: echoImages.data })
    .from(echoImages)
    .where(eq(echoImages.echoId, echoId))
  return image
}

/** One transaction, so a glitch never exists without its first echo, nor a status without its update. */
export function createEcho({ description, reporter, glitchId, status, image }: NewEcho) {
  const timestamp = new Date()

  return withNotifications(async (tx, notify) => {
    const target = glitchId
      ? await updateGlitch(tx, glitchId, reporter, status)
      : await openGlitch(tx, description, timestamp)
    const about = { actorId: reporter.guardianId, glitchId: target.glitchId }

    if (!glitchId) {
      for (const guardianId of await listCommanderIds(tx)) {
        notify({ ...about, guardianId, type: 'glitch_reported' })
      }
    } else {
      for (const guardianId of await listInvolvedIds(tx, glitchId)) {
        notify(
          target.newStatus
            ? { ...about, guardianId, type: 'glitch_status_changed', detail: target.newStatus }
            : { ...about, guardianId, type: 'glitch_updated' },
        )
      }
    }

    const [{ echoId }] = await tx
      .insert(echoes)
      .values({ ...target, description, timestamp, reportingGuardianId: reporter.guardianId })
      .returning({ echoId: echoes.echoId })
    if (image) await tx.insert(echoImages).values({ echoId, ...image })
    return { echoId, glitchId: target.glitchId }
  })
}

/** The assigned defender and whoever reported the glitch first. */
async function listInvolvedIds(tx: Transaction, glitchId: string) {
  const [glitch] = await tx
    .select({ assignedGuardianId: glitches.assignedGuardianId })
    .from(glitches)
    .where(eq(glitches.glitchId, glitchId))
  const [first] = await tx
    .select({ guardianId: echoes.reportingGuardianId })
    .from(echoes)
    .where(eq(echoes.glitchId, glitchId))
    .orderBy(asc(echoes.timestamp), asc(echoes.echoId))
    .limit(1)
  const ids = [glitch?.assignedGuardianId, first?.guardianId].filter((id) => id != null)
  return new Set(ids)
}

async function updateGlitch(
  tx: Transaction,
  glitchId: string,
  reporter: Guardian,
  status?: GlitchStatus,
) {
  // Locked, so the glitch cannot be reassigned between this check and the update.
  const [glitch] = await tx
    .select({ status: glitches.status, assignedGuardianId: glitches.assignedGuardianId })
    .from(glitches)
    .where(eq(glitches.glitchId, glitchId))
    .for('update')
  if (!glitch) throw new Error('That glitch does not exist')
  if (!status || status === glitch.status) {
    return { glitchId, status: glitch.status, newStatus: null }
  }

  if (!canChangeStatus(reporter, glitch)) {
    throw new Error('Only the assigned defender or a commander can change the status')
  }
  await tx.update(glitches).set({ status }).where(eq(glitches.glitchId, glitchId))
  return { glitchId, status, newStatus: status }
}

async function openGlitch(tx: Transaction, description: string, timestamp: Date) {
  // A sequence gives simultaneous reports different numbers.
  const { rows } = await tx.execute<{ number: string }>(
    sql`select nextval('glitch_number') as number`,
  )
  const glitchId = `GL-${rows[0].number.padStart(4, '0')}`
  const status: GlitchStatus = 'LEAKED'
  await tx.insert(glitches).values({ glitchId, status, description, timestamp })
  return { glitchId, status, newStatus: null }
}
