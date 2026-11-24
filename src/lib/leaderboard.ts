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

export const BADGES = [
  {
    id: 'first-whisper',
    label: 'First Whisper',
    description: 'Reported an echo',
    isEarned: ({ echoes }: GuardianStats) => echoes >= 1,
  },
  {
    id: 'keen-ear',
    label: 'Keen Ear',
    description: 'Reported 10 echoes',
    isEarned: ({ echoes }: GuardianStats) => echoes >= 10,
  },
  {
    id: 'rift-sealer',
    label: 'Rift Sealer',
    description: 'Fixed a glitch',
    isEarned: ({ fixes }: GuardianStats) => fixes >= 1,
  },
  {
    id: 'ward-weaver',
    label: 'Ward Weaver',
    description: 'Fixed 5 glitches',
    isEarned: ({ fixes }: GuardianStats) => fixes >= 5,
  },
  {
    id: 'grid-master',
    label: 'Master of the Grid',
    description: 'Fixed 10 glitches',
    isEarned: ({ fixes }: GuardianStats) => fixes >= 10,
  },
  {
    id: 'swift-hand',
    label: 'Swift Hand',
    description: 'Fixed a glitch within an hour',
    isEarned: ({ fastestFixMs }: GuardianStats) => fastestFixMs !== null && fastestFixMs <= HOUR_MS,
  },
] as const

export type Badge = (typeof BADGES)[number]
