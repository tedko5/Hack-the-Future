import { z } from 'zod'
import type { Guardian } from './guardian.ts'

/** Lifecycle of a glitch, in order. */
export const GLITCH_STATUSES = [
  'LEAKED',
  'ASSESSING',
  'CONTAINING',
  'FIXED',
] as const

export type GlitchStatus = (typeof GLITCH_STATUSES)[number]

/** Outcome of a commander's one attempt to hack into a glitch. */
export const HACK_RESULTS = ['SUCCESS', 'FAILED'] as const

export type HackResult = (typeof HACK_RESULTS)[number]

/** Chance that hacking into a glitch fixes it. */
export const HACK_SUCCESS_CHANCE = 0.55

/** A glitch can be hacked once, and only while it is still open. */
export function canHack(glitch: Pick<Glitch, 'status' | 'hackResult'>) {
  return glitch.status !== 'FIXED' && glitch.hackResult === null
}

export type Glitch = {
  glitchId: string
  status: GlitchStatus
  description: string
  /** ISO 8601 */
  timestamp: string
  /** null while nobody is assigned */
  assignedGuardianId: string | null
  assignedCodename: string | null
  /** null until a commander has tried to hack into it */
  hackResult: HackResult | null
}

/** Commanders always may, defenders only on a glitch assigned to them. */
export function canChangeStatus(
  guardian: Guardian,
  glitch: Pick<Glitch, 'assignedGuardianId'>,
) {
  return guardian.role === 'commander' || glitch.assignedGuardianId === guardian.guardianId
}

export const glitchIdSchema = z.string('Invalid glitch').min(1, 'Invalid glitch')

export const glitchStatusSchema = z.enum(GLITCH_STATUSES, 'Invalid status')

/** For every server function that only needs to know which glitch. */
export const glitchRefSchema = z.object({ glitchId: glitchIdSchema })

export const assignGlitchSchema = z.object({
  glitchId: glitchIdSchema,
  /** null unassigns */
  guardianId: z.string('Invalid guardian').nullable(),
})
