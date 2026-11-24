import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'achrona-theme'
const THEME_EVENT = 'achrona-theme-change'

/**
 * Runs in <head> before the page paints, so a saved light theme never flashes dark first.
 * Dark is the default and needs no attribute.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${STORAGE_KEY}')==='light')document.documentElement.dataset.theme='light'}catch(e){}`

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') root.dataset.theme = 'light'
  else delete root.dataset.theme
  window.dispatchEvent(new Event(THEME_EVENT))
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Private mode or blocked storage: the theme still applies until reload.
  }
}

/**
 * Bumps whenever the theme changes. Clerk reads its colour variables once when it mounts,
 * so the root passes it a fresh appearance object on every change to make it re-read them.
 */
export function useThemeVersion() {
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener(THEME_EVENT, bump)
    return () => window.removeEventListener(THEME_EVENT, bump)
  }, [])
  return version
}
