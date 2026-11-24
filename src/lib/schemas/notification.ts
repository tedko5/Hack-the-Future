import { z } from 'zod'
import type { Dictionary } from '../../i18n/en.ts'
import type { GlitchStatus } from './glitch.ts'
import { EVERYONE } from './message.ts'

export const NOTIFICATION_TYPES = [
  'glitch_reported',
  'glitch_assigned',
  'glitch_unassigned',
  'glitch_released',
  'glitch_updated',
  'glitch_status_changed',
  'message_received',
  'message_replied',
  'message_reacted',
  'role_changed',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export type Notification = {
  notificationId: number
  type: NotificationType
  /** Who caused it. */
  actorCodename: string
  glitch: { glitchId: string; description: string } | null
  conversationId: string | null
  /** The new status, the new role or the reaction, depending on the type. */
  detail: string | null
  /** ISO 8601 */
  createdAt: string
  isRead: boolean
}

export type NotificationText = {
  title: string
  body: string | null
  /** Where it came from, or null if there is nothing to open. */
  path: string | null
}

/** The wording of a notification. Used in the app, and meant for push and email too. */
export function describeNotification(notification: Notification, t: Dictionary): NotificationText {
  return {
    title: titleOf(notification, t),
    body: notification.glitch?.description ?? null,
    path: pathOf(notification),
  }
}

function titleOf(notification: Notification, t: Dictionary) {
  const { type, actorCodename: who, conversationId } = notification
  const glitch = notification.glitch?.glitchId ?? ''
  const detail = notification.detail ?? ''
  switch (type) {
    case 'glitch_reported':
      return t.notifications.glitchReported(who, glitch)
    case 'glitch_assigned':
      return t.notifications.glitchAssigned(who, glitch)
    case 'glitch_unassigned':
      return t.notifications.glitchUnassigned(who, glitch)
    case 'glitch_released':
      return t.notifications.glitchReleased(who, glitch)
    case 'glitch_updated':
      return t.notifications.glitchUpdated(who, glitch)
    case 'glitch_status_changed':
      return t.notifications.glitchStatusChanged(who, glitch, t.status[detail as GlitchStatus] ?? detail)
    case 'message_received':
      return t.notifications.messageReceived(who)
    case 'message_replied':
      return conversationId === EVERYONE
        ? t.notifications.messageRepliedInEveryone(who)
        : t.notifications.messageReplied(who)
    case 'message_reacted':
      return t.notifications.messageReacted(who, detail)
    case 'role_changed':
      return t.notifications.roleChanged(who, detail)
  }
}

/** Where a notification leads, in any language. */
export function pathOf({ glitch, conversationId }: Notification) {
  if (glitch) return `/glitches/${encodeURIComponent(glitch.glitchId)}`
  if (conversationId) return `/messages/${encodeURIComponent(conversationId)}`
  return null
}

export const notificationRefSchema = z.object({
  notificationId: z.int32('Invalid notification').positive('Invalid notification'),
})
