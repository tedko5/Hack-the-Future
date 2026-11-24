import { desc, eq } from 'drizzle-orm'
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

export async function updateGlitch(
  glitchId: string,
  changes: Partial<Pick<typeof glitches.$inferInsert, 'status' | 'assignedGuardianId'>>,
) {
  const updated = await db
    .update(glitches)
    .set(changes)
    .where(eq(glitches.glitchId, glitchId))
    .returning({ glitchId: glitches.glitchId })
  if (updated.length === 0) throw new Error('That glitch does not exist')
}
