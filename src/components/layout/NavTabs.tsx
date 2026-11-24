import { Link, linkOptions, useLocation, type LinkProps } from '@tanstack/react-router'
import { Map as MapIcon, MessageCircle, Trophy } from 'lucide-react'
import type { ComponentType } from 'react'
import { UnreadBadge } from '#/components/messages/UnreadBadge.tsx'
import { CrystalIcon } from '#/components/ui/CrystalIcon.tsx'
import { useT } from '#/i18n/index.ts'
import { EVERYONE } from '#/lib/message.ts'

/** A bar at the bottom of the screen on phones, a row under the header on larger screens. */
export function NavTabs({ unreadMessages }: { unreadMessages: number }) {
  const t = useT()
  const { pathname } = useLocation()
  const isIn = (section: string) => pathname === section || pathname.startsWith(`${section}/`)

  return (
    <nav
      aria-label={t.nav.label}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t-2 border-edge bg-panel md:static md:gap-2 md:self-center md:rounded-xl md:border-0 md:p-1.5 print:hidden"
    >
      <Tab
        link={linkOptions({ to: '/' })}
        icon={CrystalIcon}
        label={t.nav.missionControl}
        isActive={pathname === '/' || isIn('/glitches') || isIn('/report')}
      />
      <Tab
        link={linkOptions({ to: '/map' })}
        icon={MapIcon}
        label={t.nav.map}
        isActive={isIn('/map')}
      />
      <Tab
        link={linkOptions({
          to: '/messages/$conversationId',
          params: { conversationId: EVERYONE },
        })}
        icon={MessageCircle}
        label={t.nav.messages}
        isActive={isIn('/messages')}
        badge={unreadMessages}
      />
      <Tab
        link={linkOptions({ to: '/leaderboard' })}
        icon={Trophy}
        label={t.nav.leaderboard}
        isActive={isIn('/leaderboard')}
      />
    </nav>
  )
}

type TabProps = {
  link: Pick<LinkProps, 'to' | 'params'>
  icon: ComponentType<{ size?: number }>
  label: string
  /** Set here, because a tab also covers the pages below it. */
  isActive: boolean
  badge?: number
}

function Tab({ link, icon: Icon, label, isActive, badge = 0 }: TabProps) {
  return (
    <Link
      {...link}
      aria-current={isActive ? 'page' : undefined}
      className={`relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-center text-[.68rem] leading-tight -outline-offset-2 md:min-h-11 md:flex-none md:flex-row md:gap-2.5 md:rounded-lg md:px-4 md:text-sm md:leading-normal ${
        isActive ? 'bg-row font-bold text-highlight' : 'text-muted hover:text-highlight'
      }`}
    >
      <Icon size={20} />
      {label}
      <span className="absolute top-1.5 left-1/2 ml-3 md:static md:ml-0">
        <UnreadBadge count={badge} />
      </span>
    </Link>
  )
}
