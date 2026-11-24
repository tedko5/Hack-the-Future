import type { Guardian } from './guardian.ts'

export type GuardianStats = {
  /** Fixed glitches credited to this guardian. */
  fixes: number
  echoes: number
  /** From report to fix, or null without a fix. */
  fastestFixMs: number | null
}

export type LeaderboardEntry = Guardian &
  GuardianStats & {
    /** Equal results share a rank. */
    rank: number
    imageUrl: string | null
  }

const HOUR_MS = 60 * 60_000

/** Their names are in the dictionaries. */
export const BADGES = [
  {
    id: 'first-whisper',
    isEarned: ({ echoes }: GuardianStats) => echoes >= 1,
  },
  {
    id: 'keen-ear',
    isEarned: ({ echoes }: GuardianStats) => echoes >= 10,
  },
  {
    id: 'rift-sealer',
    isEarned: ({ fixes }: GuardianStats) => fixes >= 1,
  },
  {
    id: 'ward-weaver',
    isEarned: ({ fixes }: GuardianStats) => fixes >= 5,
  },
  {
    id: 'grid-master',
    isEarned: ({ fixes }: GuardianStats) => fixes >= 10,
  },
  {
    id: 'swift-hand',
    isEarned: ({ fastestFixMs }: GuardianStats) => fastestFixMs !== null && fastestFixMs <= HOUR_MS,
  },
] as const

export type Badge = (typeof BADGES)[number]
