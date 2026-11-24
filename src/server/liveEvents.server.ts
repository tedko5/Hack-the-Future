import pg from 'pg'
import type { LiveEvent } from '#/lib/liveEvents.ts'

const HEARTBEAT_MS = 20_000
// The browser reconnects after this, so access is checked again regularly.
const MAX_STREAM_MS = 5 * 60_000

/** What the database sends. Private events name the guardians involved, who are the only ones told. */
type ServerEvent =
  | Exclude<LiveEvent, { type: 'message' | 'notification' }>
  | { type: 'message'; senderId: string; recipientId: string | null }
  | { type: 'notification'; guardianId: string }

type Listener = (event: ServerEvent) => void

/** The event as this guardian may see it, or undefined if it is not theirs. */
function eventFor(guardianId: string, event: ServerEvent): LiveEvent | undefined {
  if (event.type === 'notification') {
    return event.guardianId === guardianId ? { type: 'notification' } : undefined
  }
  if (event.type !== 'message') return event
  const { senderId, recipientId } = event
  const isParticipant =
    recipientId === null || recipientId === guardianId || senderId === guardianId
  return isParticipant ? { type: 'message' } : undefined
}

/** Server-sent events, until the client disconnects or the stream expires. */
export function createLiveEventStream(guardianId: string, signal: AbortSignal) {
  let close = () => {}

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      let open = true
      const send = (text: string) => {
        if (open) controller.enqueue(encoder.encode(text))
      }
      const unsubscribe = liveEvents.subscribe((event) => {
        const visible = eventFor(guardianId, event)
        if (visible) send(`data: ${JSON.stringify(visible)}\n\n`)
      })
      const heartbeat = setInterval(() => send(': keep-alive\n\n'), HEARTBEAT_MS)
      const expiry = setTimeout(() => {
        close()
        controller.close()
      }, MAX_STREAM_MS)
      close = () => {
        open = false
        unsubscribe()
        clearInterval(heartbeat)
        clearTimeout(expiry)
      }
      signal.addEventListener('abort', close)
      // Every (re)connect starts with a refetch, so nothing missed stays missing.
      send(`retry: 2000\ndata: ${JSON.stringify({ type: 'resync' })}\n\n`)
    },
    cancel: () => close(),
  })
}

// One Postgres connection listens for the whole server; triggers on the tables send
// the events. Kept on globalThis so a dev reload
// does not open a second connection.
const store = globalThis as typeof globalThis & { __liveEvents?: LiveEvents }

class LiveEvents {
  private listeners = new Set<Listener>()
  private started = false

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    if (!this.started) {
      this.started = true
      void this.connect(false)
    }
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(event: ServerEvent) {
    for (const listener of this.listeners) listener(event)
  }

  private async connect(isReconnect: boolean) {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
      keepAlive: true,
    })
    let retrying = false
    const retry = (error?: Error) => {
      if (retrying) return
      retrying = true
      console.error('Live events connection lost, retrying:', error?.message ?? 'closed')
      client.end().catch(() => {})
      setTimeout(() => void this.connect(true), 2000).unref()
    }
    client.on('error', retry)
    client.on('end', () => retry())
    client.on('notification', ({ payload }) => {
      if (payload) this.emit(JSON.parse(payload) as ServerEvent)
    })
    try {
      await client.connect()
      // Do not keep the process alive, or a deploy could not stop the old server.
      // (unref is missing from the types.)
      ;(client as pg.Client & { unref(): void }).unref()
      await client.query('LISTEN live_events')
      if (isReconnect) this.emit({ type: 'resync' })
    } catch (error) {
      retry(error as Error)
    }
  }
}

export const liveEvents = (store.__liveEvents ??= new LiveEvents())
