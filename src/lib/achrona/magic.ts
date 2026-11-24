import type { GlitchStatus } from '#/lib/schemas/glitch.ts'

/** Share of the remaining magic that one glitch drains, by status. */
const DRAIN: Record<GlitchStatus, number> = {
  LEAKED: 0.15,
  ASSESSING: 0.1,
  CONTAINING: 0.05,
  FIXED: 0,
}

/** Percentage of magic left in Achrona, 0–100. Every open glitch lowers it, fixing one restores it. */
export function magicLevel(statuses: GlitchStatus[]) {
  return Math.round(statuses.reduce((magic, status) => magic * (1 - DRAIN[status]), 100))
}
