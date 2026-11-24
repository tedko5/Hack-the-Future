import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db/index.ts'
import { checkHealth } from '#/db/health.ts'
import { pings } from '#/db/schema.ts'
import { requireGuardian } from '#/lib/guardian.server.ts'

export const getHealth = createServerFn({ method: 'GET' }).handler(async () => {
  await requireGuardian()
  return checkHealth()
})

export const addPing = createServerFn({ method: 'POST' }).handler(async () => {
  await requireGuardian()
  await db.insert(pings).values({})
})
