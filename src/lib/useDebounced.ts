import { useEffect, useState } from 'react'

/** The value once it has stopped changing, so typing does not send a request per key. */
export function useDebounced<Value>(value: Value, delayMs = 250) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
