import { clerkClient } from '@clerk/tanstack-react-start/server'

const MAX_AGE_MS = 5 * 60_000
const RETRY_AFTER_ERROR_MS = 30_000
const MAX_WAIT_MS = 1500
const BATCH_SIZE = 100

type Entry = { imageUrl: string | null; staleAt: number }

// Conversations are refetched on every live event, so Clerk is not asked each time.
const cache = new Map<string, Entry>()
/** Guardians being fetched, so simultaneous requests ask Clerk once. */
const pending = new Map<string, Promise<void>>()

/** Profile pictures by guardian ID. A slow or failing Clerk only means missing pictures. */
export async function getAvatars(guardianIds: string[]): Promise<Map<string, string>> {
  const now = Date.now()
  const outdated = guardianIds.filter((id) => (cache.get(id)?.staleAt ?? 0) <= now && !pending.has(id))
  for (let i = 0; i < outdated.length; i += BATCH_SIZE) {
    const batch = outdated.slice(i, i + BATCH_SIZE)
    const refresh = fetchAvatars(batch).finally(() => batch.forEach((id) => pending.delete(id)))
    batch.forEach((id) => pending.set(id, refresh))
  }

  // Outdated pictures are still shown, so only wait for guardians without any entry.
  const unknown = guardianIds.filter((id) => !cache.has(id))
  if (unknown.length > 0) {
    await Promise.race([
      Promise.all(unknown.map((id) => pending.get(id))),
      new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS)),
    ])
    // Still loading: the next request does not wait again.
    for (const id of unknown) if (!cache.has(id)) cache.set(id, { imageUrl: null, staleAt: 0 })
  }

  const avatars = new Map<string, string>()
  for (const id of guardianIds) {
    const imageUrl = cache.get(id)?.imageUrl
    if (imageUrl) avatars.set(id, imageUrl)
  }
  return avatars
}

async function fetchAvatars(guardianIds: string[]) {
  try {
    const { data } = await clerkClient().users.getUserList({
      userId: guardianIds,
      limit: BATCH_SIZE,
    })
    const imageUrls = new Map(data.map((user) => [user.id, user.imageUrl]))
    const staleAt = Date.now() + MAX_AGE_MS
    for (const id of guardianIds) cache.set(id, { imageUrl: imageUrls.get(id) ?? null, staleAt })
  } catch (error) {
    console.error('Could not load profile pictures:', error instanceof Error ? error.message : error)
    const staleAt = Date.now() + RETRY_AFTER_ERROR_MS
    for (const id of guardianIds) {
      cache.set(id, { imageUrl: cache.get(id)?.imageUrl ?? null, staleAt })
    }
  }
}
