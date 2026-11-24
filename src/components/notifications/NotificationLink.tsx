import { useMutation } from '@tanstack/react-query'
import { Link, useRouter, type LinkProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { pathOf, type Notification } from '#/lib/notification.ts'
import { markNotificationRead } from '#/lib/notifications.functions.ts'

type Props = {
  notification: Notification
  className: string
  onOpen?: () => void
  children: ReactNode
}

/** Marks the notification read and opens where it came from, if there is such a place. */
export function NotificationLink({ notification, className, onOpen, children }: Props) {
  const router = useRouter()
  const path = pathOf(notification)
  const markRead = useMutation({
    mutationFn: () => markNotificationRead({ data: { notificationId: notification.notificationId } }),
    onSettled: () => router.invalidate(),
  })
  const open = () => {
    if (!notification.isRead) markRead.mutate()
    onOpen?.()
  }

  if (!path) {
    return (
      <button type="button" className={`${className} cursor-pointer text-left`} onClick={open}>
        {children}
      </button>
    )
  }
  return (
    // The path is filled in already, which the typed routes cannot check.
    <Link to={path as LinkProps['to']} className={className} onClick={open}>
      {children}
    </Link>
  )
}
