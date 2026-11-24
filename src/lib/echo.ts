import type { GlitchStatus } from '#/lib/glitch.ts'
import type { Guardian } from '#/lib/guardian.ts'

/** An echo as the dashboard shows it: joined with its reporter and its glitch. */
export type Echo = {
  echoId: string
  description: string
  /** ISO 8601 */
  timestamp: string
  reporter: Pick<Guardian, 'codename' | 'role'>
  glitch: { glitchId: string; status: GlitchStatus }
}
