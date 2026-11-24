import { UserButton, useClerk } from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { LanguageToggle } from '#/components/layout/LanguageToggle.tsx'
import { ThemeToggle } from '#/components/layout/ThemeToggle.tsx'
import { useT } from '#/i18n/index.ts'
import type { Guardian } from '#/lib/guardian.ts'

export function AppHeader({ guardian }: { guardian: Guardian }) {
  const t = useT()
  const { signOut } = useClerk()

  return (
    <header className="flex flex-wrap items-center justify-between gap-5 print:hidden">
      <h1 className="title-engraved font-display text-[clamp(2.3rem,6vw,3.8rem)] leading-none font-bold">
        <Link to="/">Achrona Mission Control</Link>
      </h1>
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-panel py-2 pr-2 pl-4">
        <div>
          <b className="block text-[0.95rem]">{guardian.codename}</b>
          <span className="text-[0.8rem] text-muted">Guardian</span>
        </div>
        <span className="rounded-lg bg-copper px-3 py-2 text-sm font-bold text-on-copper">
          {guardian.role}
        </span>
        <div className="flex items-center">
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            title={t.header.logOut}
            className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 px-2 text-sm text-muted hover:text-cyan"
            onClick={() => signOut()}
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t.header.logOut}</span>
          </button>
          {/* Opens Clerk's account settings. */}
          <UserButton />
        </div>
      </div>
    </header>
  )
}
