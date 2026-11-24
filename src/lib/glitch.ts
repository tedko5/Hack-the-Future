import { z } from 'zod'

/** Lifecycle of a glitch, in order. */
export const GLITCH_STATUSES = [
  'LEAKED',
  'ASSESSING',
  'CONTAINING',
  'FIXED',
] as const

export type GlitchStatus = (typeof GLITCH_STATUSES)[number]

export type Glitch = {
  glitchId: string
  status: GlitchStatus
  description: string
  /** ISO 8601 */
  timestamp: string
  /** null while nobody is assigned */
  assignedGuardianId: string | null
  assignedCodename: string | null
}

export const glitchIdSchema = z.string('Invalid glitch').min(1, 'Invalid glitch')

export const getGlitchSchema = z.object({ glitchId: glitchIdSchema })

export const setGlitchStatusSchema = z.object({
  glitchId: glitchIdSchema,
  status: z.enum(GLITCH_STATUSES, 'Invalid status'),
})

export const assignGlitchSchema = z.object({
  glitchId: glitchIdSchema,
  /** null unassigns */
  guardianId: z.string('Invalid guardian').nullable(),
})
