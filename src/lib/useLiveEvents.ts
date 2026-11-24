import { useEffect, useRef } from 'react'
import type { LiveEvent } from '#/lib/liveEvents.ts'

/** Calls onEvent for every change, e.g. `useLiveEvents(() => router.invalidate())`. */
export function useLiveEvents(onEvent: (event: LiveEvent) => void) {
  const callback = useRef(onEvent)
  useEffect(() => {
    callback.current = onEvent
  })

  useEffect(() => {
    let source: EventSource
    let timer: ReturnType<typeof setTimeout>
    const connect = () => {
      source = new EventSource('/api/events')
      source.onmessage = (message) => callback.current(JSON.parse(message.data) as LiveEvent)
      source.onerror = () => {
        // The browser retries dropped connections itself, but not refused ones.
        if (source.readyState === EventSource.CLOSED) timer = setTimeout(connect, 5000)
      }
    }
    connect()
    return () => {
      clearTimeout(timer)
      source.close()
    }
  }, [])
}
