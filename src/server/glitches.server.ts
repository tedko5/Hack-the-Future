import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { glitches, guardians } from '#/db/schema.ts'
import type { Glitch } from '#/lib/glitch.ts'

const selectGlitches = () =>
  db
    .select({
      glitchId: glitches.glitchId,
      status: glitches.status,
      description: glitches.description,
      timestamp: glitches.timestamp,
      assignedGuardianId: glitches.assignedGuardianId,
      assignedCodename: guardians.codename,
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

export async function assignGlitch(glitchId: string, guardianId: string | null) {
  const updated = await db
    .update(glitches)
    .set({ assignedGuardianId: guardianId })
    .where(eq(glitches.glitchId, glitchId))
    .returning({ glitchId: glitches.glitchId })
  if (updated.length === 0) throw new Error('That glitch does not exist')
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

export async function releaseGlitch(glitchId: string, guardianId: string) {
  const updated = await db
    .update(glitches)
    .set({ assignedGuardianId: null })
    .where(and(eq(glitches.glitchId, glitchId), eq(glitches.assignedGuardianId, guardianId)))
    .returning({ glitchId: glitches.glitchId })
  if (updated.length === 0) throw new Error('That glitch is not assigned to you')
}
