import { Link } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { UnreadBadge } from '#/components/messages/UnreadBadge.tsx'
import { useT } from '#/i18n/index.ts'

export function NotificationsLink({ unread }: { unread: number }) {
  const t = useT()
  return (
    <Link
      to="/notifications"
      title={t.nav.notifications}
      className="relative flex size-11 items-center justify-center rounded-lg"
      activeProps={{ className: 'bg-row text-highlight' }}
      inactiveProps={{ className: 'text-muted hover:text-highlight' }}
    >
      <Bell size={20} aria-hidden="true" />
      <span className="sr-only">{t.nav.notifications}</span>
      <span className="absolute -top-0.5 left-1/2 flex whitespace-nowrap">
        <UnreadBadge count={unread} />
      </span>
    </Link>
  )
}
