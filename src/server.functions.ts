import { createServerFn } from '@tanstack/react-start'
import { db } from './db'
import { checkHealth } from './db/health'
import { pings } from './db/schema'

export const getHealth = createServerFn({ method: 'GET' }).handler(() => checkHealth())

export const addPing = createServerFn({ method: 'POST' }).handler(async () => {
  await db.insert(pings).values({})
})
