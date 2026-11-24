import { asc, eq, sql } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { echoes, glitches, guardians } from '#/db/schema.ts'
import type { Echo } from '#/lib/echo.ts'

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

type NewEcho = {
  description: string
  reportingGuardianId: string
  /** Opens a new glitch when left out. */
  glitchId?: string
}

/** Oldest first. */
export async function listEchoes(glitchId: string): Promise<Echo[]> {
  const rows = await db
    .select({
      echoId: echoes.echoId,
      glitchId: echoes.glitchId,
      description: echoes.description,
      timestamp: echoes.timestamp,
      reportingGuardianId: echoes.reportingGuardianId,
      reportingCodename: guardians.codename,
    })
    .from(echoes)
    .innerJoin(guardians, eq(guardians.guardianId, echoes.reportingGuardianId))
    .where(eq(echoes.glitchId, glitchId))
    .orderBy(asc(echoes.timestamp), asc(echoes.echoId))
  return rows.map((row) => ({ ...row, timestamp: row.timestamp.toISOString() }))
}

/** One transaction, so a glitch never exists without its first echo. */
export function createEcho({ description, reportingGuardianId, glitchId }: NewEcho) {
  const timestamp = new Date()

  return db.transaction(async (tx) => {
    const targetId = glitchId
      ? await requireGlitch(tx, glitchId)
      : await openGlitch(tx, description, timestamp)

    const [{ echoId }] = await tx
      .insert(echoes)
      .values({ glitchId: targetId, description, timestamp, reportingGuardianId })
      .returning({ echoId: echoes.echoId })
    return { echoId, glitchId: targetId }
  })
}

async function requireGlitch(tx: Transaction, glitchId: string) {
  const [existing] = await tx
    .select({ glitchId: glitches.glitchId })
    .from(glitches)
    .where(eq(glitches.glitchId, glitchId))
  if (!existing) throw new Error('That glitch does not exist')
  return existing.glitchId
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
