import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { echoes, glitches } from '#/db/schema.ts'
import type { LeaderboardEntry } from '#/lib/leaderboard.ts'
import { getAvatars } from '#/server/avatars.server.ts'
import { listGuardians } from '#/server/guardians.server.ts'

/** Most fixes first, then most echoes. */
export async function listLeaderboard(): Promise<LeaderboardEntry[]> {
  const [guardians, fixes, echoCounts] = await Promise.all([
    listGuardians(),
    listFixes(),
    db
      .select({ guardianId: echoes.reportingGuardianId, echoes: count() })
      .from(echoes)
      .groupBy(echoes.reportingGuardianId),
  ])
  const avatars = await getAvatars(guardians.map(({ guardianId }) => guardianId))
  const echoesOf = new Map(echoCounts.map((row) => [row.guardianId, row.echoes]))

  const entries = guardians
    .map((guardian) => {
      const fixTimes = fixes
        .filter(({ guardianId }) => guardianId === guardian.guardianId)
        .map(({ reportedAt, fixedAt }) => fixedAt.getTime() - reportedAt.getTime())
      return {
        ...guardian,
        imageUrl: avatars.get(guardian.guardianId) ?? null,
        fixes: fixTimes.length,
        echoes: echoesOf.get(guardian.guardianId) ?? 0,
        fastestFixMs: fixTimes.length > 0 ? Math.min(...fixTimes) : null,
      }
    })
    .sort((a, b) => b.fixes - a.fixes || b.echoes - a.echoes)

  return entries.map((entry) => ({
    ...entry,
    rank: 1 + entries.findIndex((other) => other.fixes === entry.fixes && other.echoes === entry.echoes),
  }))
}

/**
 * Whoever fixed each glitch last, as long as it is still fixed. Reopening and fixing a
 * glitch again therefore never counts twice.
 */
function listFixes() {
  return db
    .selectDistinctOn([echoes.glitchId], {
      guardianId: echoes.reportingGuardianId,
      reportedAt: glitches.timestamp,
      fixedAt: echoes.timestamp,
    })
    .from(echoes)
    .innerJoin(glitches, eq(glitches.glitchId, echoes.glitchId))
    .where(and(eq(echoes.newStatus, 'FIXED'), eq(glitches.status, 'FIXED')))
    .orderBy(echoes.glitchId, desc(echoes.timestamp), desc(echoes.echoId))
}
