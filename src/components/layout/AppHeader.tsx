import { UserButton, useClerk } from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '#/components/layout/ThemeToggle.tsx'
import type { Guardian } from '#/lib/guardian.ts'

const linkClass = 'flex min-h-11 items-center px-2 text-sm text-muted hover:text-cyan'

export function AppHeader({ guardian }: { guardian: Guardian }) {
  const { signOut } = useClerk()

  return (
    <header className="flex flex-wrap items-center justify-between gap-5">
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
        {guardian.role === 'commander' && (
          <Link to="/guardians" className={linkClass}>
            Guardians
          </Link>
        )}
        <ThemeToggle />
        <button type="button" className={`${linkClass} cursor-pointer`} onClick={() => signOut()}>
          Log out
        </button>
        {/* Opens Clerk's account settings. */}
        <UserButton />
      </div>
    </header>
  )
}
