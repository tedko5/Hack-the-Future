export const GUARDIAN_ROLES = ['defender', 'commander'] as const

export type GuardianRole = (typeof GUARDIAN_ROLES)[number]

export type Guardian = {
  /** Clerk user ID */
  guardianId: string
  codename: string
  role: GuardianRole
}
