import { useEffect, useRef } from 'react'

/** Runs a callback when its key is pressed, except while typing or with a dialog open. */
export function useShortcuts(shortcuts: Record<string, () => void>) {
  const current = useRef(shortcuts)
  useEffect(() => {
    current.current = shortcuts
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return
      if (isTyping(event.target) || document.querySelector('dialog[open]')) return
      const run = current.current[event.key]
      if (!run) return
      event.preventDefault()
      run()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable]') !== null
}
