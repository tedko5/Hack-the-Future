import { z } from 'zod'
import { glitchIdSchema, glitchStatusSchema, type Glitch, type GlitchStatus } from './glitch.ts'
import type { Guardian } from './guardian.ts'

export const ECHO_MAX_LENGTH = 1000

/** An echo joined with its reporter and its glitch. */
export type Echo = {
  echoId: number
  description: string
  /** ISO 8601 */
  timestamp: string
  /** The glitch's status right after this echo; glitch.status is the current one. */
  status: GlitchStatus
  /** The status this echo gave the glitch, or null if it left it alone. */
  newStatus: GlitchStatus | null
  reporter: Guardian
  glitch: Pick<Glitch, 'glitchId' | 'status'>
}

/** Echoes are ordered newest first. */
export type GlitchDetails = Glitch & { echoes: Echo[] }

const descriptionMessage = `Describe the echo in 1 to ${ECHO_MAX_LENGTH} characters`

export const reportEchoSchema = z
  .object({
    description: z
      .string(descriptionMessage)
      .trim()
      .min(1, descriptionMessage)
      .max(ECHO_MAX_LENGTH, descriptionMessage),
    /** Leave out to open a new glitch. */
    glitchId: glitchIdSchema.optional(),
    /** Changes the glitch's status along with the update. */
    status: glitchStatusSchema.optional(),
  })
  .refine(({ glitchId, status }) => glitchId || !status, 'A new glitch always starts as leaked')
