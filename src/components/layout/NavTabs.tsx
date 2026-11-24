import { Link, linkOptions, useLocation, type LinkProps } from '@tanstack/react-router'
import { Bell, MessageCircle, Trophy, Users } from 'lucide-react'
import type { ComponentType } from 'react'
import { UnreadBadge } from '#/components/messages/UnreadBadge.tsx'
import { CrystalIcon } from '#/components/ui/CrystalIcon.tsx'
import type { Guardian } from '#/lib/guardian.ts'
import { EVERYONE } from '#/lib/message.ts'

type Props = {
  guardian: Guardian
  unreadMessages: number
  unreadNotifications: number
}

/** A bar at the bottom of the screen on phones, a row under the header on larger screens. */
export function NavTabs({ guardian, unreadMessages, unreadNotifications }: Props) {
  const { pathname } = useLocation()
  const isIn = (section: string) => pathname === section || pathname.startsWith(`${section}/`)

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t-2 border-edge bg-panel md:static md:gap-2 md:self-start md:rounded-xl md:border-0 md:p-1.5 print:hidden"
    >
      <Tab
        link={linkOptions({ to: '/' })}
        icon={CrystalIcon}
        label="Mission control"
        isActive={pathname === '/' || isIn('/glitches') || isIn('/report')}
      />
      <Tab
        link={linkOptions({
          to: '/messages/$conversationId',
          params: { conversationId: EVERYONE },
        })}
        icon={MessageCircle}
        label="Messages"
        isActive={isIn('/messages')}
        badge={unreadMessages}
      />
      <Tab
        link={linkOptions({ to: '/notifications' })}
        icon={Bell}
        label="Notifications"
        isActive={isIn('/notifications')}
        badge={unreadNotifications}
      />
      <Tab
        link={linkOptions({ to: '/leaderboard' })}
        icon={Trophy}
        label="Leaderboard"
        isActive={isIn('/leaderboard')}
      />
      {guardian.role === 'commander' && (
        <Tab
          link={linkOptions({ to: '/guardians' })}
          icon={Users}
          label="Guardians"
          isActive={isIn('/guardians')}
        />
      )}
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
        isActive ? 'bg-row font-bold text-cyan' : 'text-muted hover:text-cyan'
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
