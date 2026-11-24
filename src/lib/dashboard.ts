import type { Echo } from './echo.ts'
import type { Glitch } from './glitch.ts'
import type { Guardian } from './guardian.ts'

export type Dashboard = {
  guardian: Guardian
  /** Percentage of magic left in Achrona, 0–100. */
  magic: number
  /** Newest first. */
  glitches: Glitch[]
  /** Newest first. */
  echoes: Echo[]
}
