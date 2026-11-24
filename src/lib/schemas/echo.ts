import { z } from 'zod'
import { glitchIdSchema, glitchStatusSchema, type Glitch, type GlitchStatus } from './glitch.ts'
import type { Guardian } from './guardian.ts'
import { imageSchema } from './image.ts'

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
  hasImage: boolean
  isEdited: boolean
  reporter: Guardian
  glitch: Pick<Glitch, 'glitchId' | 'status'>
}

/** Echoes are ordered newest first. */
export type GlitchDetails = Glitch & { echoes: Echo[] }

const descriptionMessage = `Describe the echo in 1 to ${ECHO_MAX_LENGTH} characters`

export const descriptionSchema = z
  .string(descriptionMessage)
  .trim()
  .min(1, descriptionMessage)
  .max(ECHO_MAX_LENGTH, descriptionMessage)

/** Authors may edit their own echoes, commanders all of them. */
export function canEditEcho(guardian: Guardian, reporterId: string) {
  return guardian.role === 'commander' || guardian.guardianId === reporterId
}

const echoIdSchema = z.int32('Invalid echo').positive('Invalid echo')

export const echoRefSchema = z.object({ echoId: echoIdSchema })

export const editEchoSchema = z.object({ echoId: echoIdSchema, description: descriptionSchema })

export const editGlitchSchema = z.object({
  glitchId: glitchIdSchema,
  description: descriptionSchema,
})

/** Sent as a form, because it can carry an image. */
export const reportEchoSchema = z.preprocess(
  (input) =>
    input instanceof FormData
      ? {
          description: input.get('description'),
          glitchId: input.get('glitchId') ?? undefined,
          status: input.get('status') ?? undefined,
          image: input.get('image') ?? undefined,
        }
      : input,
  z
    .object({
      description: descriptionSchema,
      /** Leave out to open a new glitch. */
      glitchId: glitchIdSchema.optional(),
      /** Changes the glitch's status along with the update. */
      status: glitchStatusSchema.optional(),
      image: imageSchema.optional(),
    })
    .refine(({ glitchId, status }) => glitchId || !status, 'A new glitch always starts as leaked'),
)
