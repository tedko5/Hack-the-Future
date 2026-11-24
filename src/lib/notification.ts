import { z } from 'zod'
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
export function describeNotification(notification: Notification): NotificationText {
  return {
    title: titleOf(notification),
    body: notification.glitch?.description ?? null,
    path: pathOf(notification),
  }
}

function titleOf({ type, actorCodename, glitch, conversationId, detail }: Notification) {
  const glitchId = glitch?.glitchId ?? 'a glitch'
  switch (type) {
    case 'glitch_reported':
      return `${actorCodename} reported ${glitchId}`
    case 'glitch_assigned':
      return `${actorCodename} assigned ${glitchId} to you`
    case 'glitch_unassigned':
      return `${actorCodename} took you off ${glitchId}`
    case 'glitch_released':
      return `${actorCodename} released ${glitchId}`
    case 'glitch_updated':
      return `${actorCodename} added an update to ${glitchId}`
    case 'glitch_status_changed':
      return `${actorCodename} changed ${glitchId} to ${(detail ?? '').toLowerCase()}`
    case 'message_received':
      return `${actorCodename} sent you a message`
    case 'message_replied':
      return `${actorCodename} replied to you${conversationId === EVERYONE ? ' in All guardians' : ''}`
    case 'message_reacted':
      return `${actorCodename} reacted ${detail ?? ''} to your message`
    case 'role_changed':
      return `${actorCodename} made you a ${detail ?? 'guardian'}`
  }
}

function pathOf({ glitch, conversationId }: Notification) {
  if (glitch) return `/glitches/${encodeURIComponent(glitch.glitchId)}`
  if (conversationId) return `/messages/${encodeURIComponent(conversationId)}`
  return null
}

export const notificationRefSchema = z.object({
  notificationId: z.int32('Invalid notification').positive('Invalid notification'),
})
