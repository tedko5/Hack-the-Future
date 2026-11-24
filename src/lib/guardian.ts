import { z } from 'zod'

export const GUARDIAN_ROLES = ['defender', 'commander'] as const

export type GuardianRole = (typeof GUARDIAN_ROLES)[number]

export type Guardian = {
  /** Clerk user ID */
  guardianId: string
  codename: string
  role: GuardianRole
}

const codenameMessage = 'Use 3 to 24 letters, digits, spaces, - or _'

export const registerGuardianSchema = z.object({
  codename: z
    .string(codenameMessage)
    .trim()
    .regex(/^[A-Za-z0-9 _-]{3,24}$/, codenameMessage),
})

export const setGuardianRoleSchema = z.object({
  guardianId: z.string('Invalid guardian'),
  role: z.enum(GUARDIAN_ROLES, 'Invalid role'),
})
