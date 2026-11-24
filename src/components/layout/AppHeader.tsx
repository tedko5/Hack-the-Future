import { UserButton, useClerk } from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { CodenameButton } from '#/components/guardians/CodenameButton.tsx'
import { LanguageToggle } from '#/components/layout/LanguageToggle.tsx'
import { ThemeToggle } from '#/components/layout/ThemeToggle.tsx'
import { NotificationsLink } from '#/components/notifications/NotificationsLink.tsx'
import { useT } from '#/i18n/index.ts'
import type { Guardian } from '#/lib/guardian.ts'

type Props = {
  guardian: Guardian
  unreadNotifications: number
}

export function AppHeader({ guardian, unreadNotifications }: Props) {
  const t = useT()
  const { signOut } = useClerk()

  return (
    <header className="flex flex-wrap items-center justify-between gap-5 print:hidden">
      <h1 className="title-engraved font-display text-[clamp(2.3rem,6vw,3.4rem)] leading-none font-bold">
        <Link to="/">Achrona Mission Control</Link>
      </h1>
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-panel py-2 pr-2 pl-4">
        <div>
          <CodenameButton codename={guardian.codename} />
          <span className="text-[0.8rem] text-muted capitalize">{guardian.role}</span>
        </div>
        <div className="flex items-center">
          <NotificationsLink unread={unreadNotifications} />
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            aria-label={t.header.logOut}
            title={t.header.logOut}
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-highlight"
            onClick={() => signOut()}
          >
            <LogOut size={20} aria-hidden="true" />
          </button>
          {/* Opens Clerk's account settings. */}
          <UserButton />
        </div>
      </div>
    </header>
  )
}
