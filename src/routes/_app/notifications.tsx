import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { CheckCheck } from 'lucide-react'
import { NotificationIcon } from '#/components/notifications/NotificationIcon.tsx'
import { NotificationLink } from '#/components/notifications/NotificationLink.tsx'
import { formatDateTime } from '#/lib/formatDate.ts'
import { describeNotification, type Notification } from '#/lib/notification.ts'
import { getNotifications, markAllNotificationsRead } from '#/lib/notifications.functions.ts'

export const Route = createFileRoute('/_app/notifications')({
  loader: () => getNotifications(),
  component: NotificationsPage,
})

function NotificationsPage() {
  const notifications = Route.useLoaderData()
  const router = useRouter()
  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSettled: () => router.invalidate(),
  })

  return (
    <section
      aria-labelledby="notifications-title"
      className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="notifications-title" className="font-display text-[1.6rem] font-bold">
          Notifications
        </h2>
        {notifications.some(({ isRead }) => !isRead) && (
          <button
            type="button"
            className="flex min-h-11 cursor-pointer items-center gap-2 px-2 text-sm text-muted hover:text-cyan disabled:opacity-50"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck size={18} aria-hidden="true" />
            Mark all as read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="rounded-xl border-2 border-edge bg-well p-4 text-muted">
          Nothing yet. All quiet in Achrona.
        </p>
      ) : (
        <ul className="tech-frame divide-y divide-line overflow-hidden rounded-xl border-2 border-edge bg-well">
          {notifications.map((notification) => (
            <li key={notification.notificationId}>
              <NotificationRow notification={notification} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function NotificationRow({ notification }: { notification: Notification }) {
  const { title, body, path } = describeNotification(notification)

  return (
    <NotificationLink
      notification={notification}
      className={`flex w-full items-center gap-3 px-4 py-3 -outline-offset-2 hover:bg-row ${notification.isRead ? 'text-muted' : ''}`}
    >
      <NotificationIcon type={notification.type} />
      <span className="min-w-0 flex-1">
        <span className={`block leading-snug ${notification.isRead ? '' : 'font-bold'}`}>
          <span className={path ? 'clickable' : ''}>{title}</span>
        </span>
        {body && <span className="block truncate text-[.85rem] text-muted">{body}</span>}
        <time dateTime={notification.createdAt} className="text-[.85rem] text-muted">
          {formatDateTime(notification.createdAt)}
        </time>
      </span>
      {!notification.isRead && (
        <span className="size-2.5 shrink-0 rounded-full bg-copper">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </NotificationLink>
  )
}
