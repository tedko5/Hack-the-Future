import { createServerFn } from '@tanstack/react-start'
import { db } from '#/db/index.ts'
import { checkHealth } from '#/db/health.ts'
import { pings } from '#/db/schema.ts'

export const getHealth = createServerFn({ method: 'GET' }).handler(() => checkHealth())

export const addPing = createServerFn({ method: 'POST' }).handler(async () => {
  await db.insert(pings).values({})
})
