import { GLITCH_STATUSES, type Glitch } from './glitch.ts'

export type GlitchSort = 'newest' | 'oldest' | 'urgent' | 'assignee'

const byNewest = (a: Glitch, b: Glitch) => b.timestamp.localeCompare(a.timestamp)

const COMPARE: Record<GlitchSort, (a: Glitch, b: Glitch) => number> = {
  newest: byNewest,
  oldest: (a, b) => -byNewest(a, b),
  // The lifecycle runs from most to least urgent.
  urgent: (a, b) =>
    GLITCH_STATUSES.indexOf(a.status) - GLITCH_STATUSES.indexOf(b.status) || byNewest(a, b),
  // Unassigned ones first, because they still need someone.
  assignee: (a, b) =>
    (a.assignedCodename ?? '').localeCompare(b.assignedCodename ?? '') || byNewest(a, b),
}

export function sortGlitches(glitches: Glitch[], sort: GlitchSort) {
  return glitches.toSorted(COMPARE[sort])
}
