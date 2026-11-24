import { z } from 'zod'
import { glitchIdSchema, type Glitch } from './glitch.ts'

export const ECHO_MAX_LENGTH = 1000

export type Echo = {
  echoId: number
  glitchId: string
  description: string
  /** ISO 8601 */
  timestamp: string
  reportingGuardianId: string
  reportingCodename: string
}

/** Echoes are ordered oldest first. */
export type GlitchDetails = Glitch & { echoes: Echo[] }

const descriptionMessage = `Describe the echo in 1 to ${ECHO_MAX_LENGTH} characters`

export const reportEchoSchema = z.object({
  description: z
    .string(descriptionMessage)
    .trim()
    .min(1, descriptionMessage)
    .max(ECHO_MAX_LENGTH, descriptionMessage),
  /** Leave out to open a new glitch. */
  glitchId: glitchIdSchema.optional(),
})
