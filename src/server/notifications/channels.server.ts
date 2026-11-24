import type { Notification, NotificationText } from '#/lib/notification.ts'

export type Delivery = NotificationText & {
  /** Who receives it. This is also the Clerk user ID, which is how to find an email address. */
  guardianId: string
  notification: Notification
}

/**
 * A way to reach a guardian outside the app. Called once per notification, after it is
 * saved. Throwing is fine: it is logged and never affects the app or other channels.
 */
export type NotificationChannel = {
  name: string
  send: (delivery: Delivery) => Promise<void>
}

/** Add push and email here. The notification center and pop-up do not need a channel. */
export const channels: NotificationChannel[] = []
