import { useEffect, useState } from 'react'

/** A boolean kept in this browser. Off during server rendering, and when storage is blocked. */
export function useStoredFlag(key: string) {
  const [value, setValue] = useState(false)

  // Read after mount, so the first render matches the server's.
  useEffect(() => {
    try {
      setValue(localStorage.getItem(key) === 'true')
    } catch {
      // Storage is blocked: keep the default.
    }
  }, [key])

  function store(next: boolean) {
    setValue(next)
    try {
      localStorage.setItem(key, String(next))
    } catch {
      // Storage is blocked: the value lasts until the page is left.
    }
  }

  return [value, store] as const
}
