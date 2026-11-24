import { useLocation } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NotificationIcon } from '#/components/notifications/NotificationIcon.tsx'
import { NotificationLink } from '#/components/notifications/NotificationLink.tsx'
import { useT } from '#/i18n/index.ts'
import { describeNotification, pathOf, type Notification } from '#/lib/schemas/notification.ts'

const VISIBLE_MS = 6000

/** Shows a notification for a moment when it arrives. Older unread ones stay in the center. */
export function NotificationToast({ latest }: { latest: Notification | null }) {
  const t = useT()
  const { pathname } = useLocation()
  const lastSeenId = useRef(latest?.notificationId ?? 0)
  const [shown, setShown] = useState<Notification | null>(null)

  useEffect(() => {
    if (!latest || latest.notificationId <= lastSeenId.current) return
    lastSeenId.current = latest.notificationId
    // Not for what is on screen already.
    if (pathname !== '/notifications' && pathname !== pathOf(latest)) setShown(latest)
  }, [latest, pathname])

  useEffect(() => {
    if (!shown) return
    const timer = setTimeout(() => setShown(null), VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [shown])

  return (
    <div role="status" className="fixed inset-x-4 top-4 z-50 sm:left-auto sm:w-96">
      {shown && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-edge bg-panel p-2 shadow-[0_12px_40px_rgb(0_0_0/0.55)]">
          <NotificationLink
            notification={shown}
            onOpen={() => setShown(null)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 hover:bg-row"
          >
            <NotificationIcon type={shown.type} />
            <span className="min-w-0">{describeNotification(shown, t).title}</span>
          </NotificationLink>
          <button
            type="button"
            aria-label={t.notifications.dismiss}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-fg"
            onClick={() => setShown(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
