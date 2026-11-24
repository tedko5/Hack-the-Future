import { Cog, MoonStar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getTheme, setTheme, type Theme } from '#/lib/theme.ts'

/** Switches between the dark (rift) and light (brass) themes. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  // The server can't know the saved theme; read it once mounted.
  const [theme, setThemeState] = useState<Theme | null>(null)
  useEffect(() => setThemeState(getTheme()), [])

  const next: Theme = theme === 'light' ? 'dark' : 'light'
  const label = next === 'light' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        setTheme(next)
        setThemeState(next)
      }}
      className={`flex size-11 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-fg ${className}`}
    >
      {/* Shows the theme you would switch to. */}
      {theme === 'light' ? <MoonStar size={20} aria-hidden="true" /> : <Cog size={20} aria-hidden="true" />}
    </button>
  )
}
