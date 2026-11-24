import { useEffect, useState } from 'react'

/** A boolean kept in this browser. The default applies until it is first changed. */
export function useStoredFlag(key: string, defaultValue = false) {
  const [value, setValue] = useState(defaultValue)

  // Read after mount, so the first render matches the server's.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) setValue(stored === 'true')
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
