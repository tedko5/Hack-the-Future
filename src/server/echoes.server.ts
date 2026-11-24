import { asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { echoes, glitches, guardians } from '#/db/schema.ts'
import type { Echo } from '#/lib/echo.ts'
import { canChangeStatus, type GlitchStatus } from '#/lib/glitch.ts'
import type { Guardian } from '#/lib/guardian.ts'

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

type NewEcho = {
  description: string
  reporter: Guardian
  /** Opens a new glitch when left out. */
  glitchId?: string
  /** Changes the status of the existing glitch. */
  status?: GlitchStatus
}

const selectEchoes = () =>
  db
    .select({
      echoId: echoes.echoId,
      description: echoes.description,
      timestamp: echoes.timestamp,
      newStatus: echoes.newStatus,
      reporter: { codename: guardians.codename, role: guardians.role },
      glitch: { glitchId: glitches.glitchId, status: glitches.status },
    })
    .from(echoes)
    .innerJoin(guardians, eq(guardians.guardianId, echoes.reportingGuardianId))
    .innerJoin(glitches, eq(glitches.glitchId, echoes.glitchId))

type EchoRow = Awaited<ReturnType<typeof selectEchoes>>[number]

const toEcho = (row: EchoRow): Echo => ({ ...row, timestamp: row.timestamp.toISOString() })

/** Newest first. */
export async function listEchoes(): Promise<Echo[]> {
  return (await selectEchoes().orderBy(desc(echoes.timestamp), desc(echoes.echoId))).map(toEcho)
}

/** Oldest first. */
export async function listGlitchEchoes(glitchId: string): Promise<Echo[]> {
  const rows = await selectEchoes()
    .where(eq(echoes.glitchId, glitchId))
    .orderBy(asc(echoes.timestamp), asc(echoes.echoId))
  return rows.map(toEcho)
}

/** One transaction, so a glitch never exists without its first echo, nor a status without its update. */
export function createEcho({ description, reporter, glitchId, status }: NewEcho) {
  const timestamp = new Date()

  return db.transaction(async (tx) => {
    const target = glitchId
      ? await updateStatus(tx, glitchId, reporter, status)
      : { glitchId: await openGlitch(tx, description, timestamp), newStatus: null }

    const [{ echoId }] = await tx
      .insert(echoes)
      .values({ ...target, description, timestamp, reportingGuardianId: reporter.guardianId })
      .returning({ echoId: echoes.echoId })
    return { echoId, glitchId: target.glitchId }
  })
}

async function updateStatus(
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
  if (!status || status === glitch.status) return { glitchId, newStatus: null }

  if (!canChangeStatus(reporter, glitch)) {
    throw new Error('Only the assigned defender or a commander can change the status')
  }
  await tx.update(glitches).set({ status }).where(eq(glitches.glitchId, glitchId))
  return { glitchId, newStatus: status }
}

async function openGlitch(tx: Transaction, description: string, timestamp: Date) {
  // A sequence gives simultaneous reports different numbers.
  const { rows } = await tx.execute<{ number: string }>(
    sql`select nextval('glitch_number') as number`,
  )
  const glitchId = `GL-${rows[0].number.padStart(4, '0')}`
  await tx.insert(glitches).values({ glitchId, status: 'LEAKED', description, timestamp })
  return glitchId
}
