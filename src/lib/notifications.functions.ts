import { createServerFn } from '@tanstack/react-start'
import { notificationRefSchema } from '#/lib/notification.ts'
import { validate } from '#/lib/validate.ts'
import { guardianMiddleware } from '#/middleware/auth.ts'
import { countAllUnread } from '#/server/messages.server.ts'
import * as notifications from '#/server/notifications/notifications.server.ts'

/** What the navigation and the pop-up show on every page. */
export const getInbox = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(async ({ context }) => {
    const { guardianId } = context.guardian
    const [unreadMessages, { unread, latest }] = await Promise.all([
      countAllUnread(guardianId),
      notifications.summarizeUnread(guardianId),
    ])
    return { unreadMessages, unreadNotifications: unread, latestNotification: latest }
  })

export const getNotifications = createServerFn({ method: 'GET' })
  .middleware([guardianMiddleware])
  .handler(({ context }) => notifications.listNotifications(context.guardian.guardianId))

export const markNotificationRead = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .validator(validate(notificationRefSchema))
  .handler(({ data, context }) =>
    notifications.markNotificationRead(context.guardian.guardianId, data.notificationId),
  )

export const markAllNotificationsRead = createServerFn({ method: 'POST' })
  .middleware([guardianMiddleware])
  .handler(({ context }) => notifications.markAllNotificationsRead(context.guardian.guardianId))
