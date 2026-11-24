import { z } from 'zod'

export const GUARDIAN_ROLES = ['defender', 'commander'] as const

export type GuardianRole = (typeof GUARDIAN_ROLES)[number]

export type Guardian = {
  /** Clerk user ID */
  guardianId: string
  codename: string
  role: GuardianRole
}

export const CODENAME_MIN_LENGTH = 3
export const CODENAME_MAX_LENGTH = 24

const codenameMessage = `Use ${CODENAME_MIN_LENGTH} to ${CODENAME_MAX_LENGTH} letters, digits, spaces, - or _`

/** For choosing a codename, and for changing it later. */
export const codenameSchema = z.object({
  codename: z
    .string(codenameMessage)
    .trim()
    .min(CODENAME_MIN_LENGTH, codenameMessage)
    .max(CODENAME_MAX_LENGTH, codenameMessage)
    .regex(/^[A-Za-z0-9 _-]+$/, codenameMessage),
})

export const setGuardianRoleSchema = z.object({
  guardianId: z.string('Invalid guardian'),
  role: z.enum(GUARDIAN_ROLES, 'Invalid role'),
})
