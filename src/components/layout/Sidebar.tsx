import { UserButton } from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { Activity, LayoutGrid, Users, type LucideIcon } from 'lucide-react'
import type { Guardian } from '#/lib/guardian.ts'

type NavItem = {
  label: string
  icon: LucideIcon
  /** Only set for pages that already have a route. */
  to?: '/' | '/guardians'
  commanderOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutGrid, to: '/' },
  { label: 'Guardians', icon: Users, to: '/guardians', commanderOnly: true },
]

// Icon-only items: the label lives in aria-label/title for screen readers and hover.
const itemClass =
  'flex size-12 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white'
const activeClass = 'bg-white/10 text-white'

export function Sidebar({ guardian }: { guardian: Guardian }) {
  const items = navItems.filter((item) => !item.commanderOnly || guardian.role === 'commander')

  return (
    <aside className="sticky top-0 flex h-screen w-20 shrink-0 flex-col items-center bg-sidebar py-5">
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-accent-from to-accent-to text-white shadow-md shadow-black/30">
        <Activity className="size-7" strokeWidth={2} />
      </div>

      <nav className="flex w-full flex-1 flex-col items-center gap-1">
        {items.map(({ label, icon: Icon, to }) => {
          const icon = <Icon className="size-6" strokeWidth={1.5} />
          return to ? (
            <Link
              key={label}
              to={to}
              aria-label={label}
              title={label}
              className={itemClass}
              activeOptions={{ exact: true }}
              activeProps={{ className: activeClass }}
            >
              {icon}
            </Link>
          ) : (
            <button key={label} type="button" aria-label={label} title={label} className={itemClass}>
              {icon}
            </button>
          )
        })}
      </nav>

      <div className="flex w-full flex-col items-center gap-4">
        <UserButton />
      </div>
    </aside>
  )
}
