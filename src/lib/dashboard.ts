import type { Echo } from './echo.ts'
import type { Guardian } from './guardian.ts'

export type Dashboard = {
  guardian: Guardian
  /** Percentage of magic left in Achrona, 0–100. */
  magic: number
  /** Newest first. */
  echoes: Echo[]
}
