import { and, eq, isNull } from 'drizzle-orm'
import { db, type Transaction } from '#/db/index.ts'
import { notifications } from '#/db/schema.ts'
import { describeNotification, type NotificationType } from '#/lib/notification.ts'
import { channels, type Delivery } from '#/server/notifications/channels.server.ts'
import { findNotifications } from '#/server/notifications/notifications.server.ts'

export type NewNotification = {
  /** Who receives it. Nothing is sent when this is also the actor. */
  guardianId: string
  actorId: string
  type: NotificationType
  glitchId?: string
  messageId?: number
  conversationId?: string
  detail?: string
}

type Notify = (notification: NewNotification) => void

/** A chat can produce many of these, so only the newest unread one per sender is kept. */
const COLLAPSED: NotificationType[] = ['message_received', 'message_reacted']

/**
 * Runs work in a transaction that can call notify(). The notifications are saved together
 * with the change, so there is never one without the other, and delivered once it is final.
 */
export async function withNotifications<Result>(
  work: (tx: Transaction, notify: Notify) => Promise<Result>,
): Promise<Result> {
  const { result, notificationIds } = await db.transaction(async (tx) => {
    const queued: NewNotification[] = []
    const result = await work(tx, (notification) => {
      if (notification.guardianId !== notification.actorId) queued.push(notification)
    })
    return { result, notificationIds: await save(tx, queued) }
  })
  // Not awaited: a slow email server must not slow down the app.
  if (notificationIds.length > 0 && channels.length > 0) void deliver(notificationIds)
  return result
}

async function save(tx: Transaction, queued: NewNotification[]) {
  if (queued.length === 0) return []
  for (const notification of queued) {
    if (COLLAPSED.includes(notification.type)) await removeUnreadDuplicate(tx, notification)
  }
  const rows = await tx
    .insert(notifications)
    .values(queued)
    .returning({ notificationId: notifications.notificationId })
  return rows.map((row) => row.notificationId)
}

async function removeUnreadDuplicate(tx: Transaction, notification: NewNotification) {
  const { guardianId, actorId, type, conversationId, messageId } = notification
  await tx
    .delete(notifications)
    .where(
      and(
        eq(notifications.guardianId, guardianId),
        eq(notifications.actorId, actorId),
        eq(notifications.type, type),
        isNull(notifications.readAt),
        conversationId ? eq(notifications.conversationId, conversationId) : undefined,
        type === 'message_reacted' && messageId
          ? eq(notifications.messageId, messageId)
          : undefined,
      ),
    )
}

async function deliver(notificationIds: number[]) {
  try {
    const found = await findNotifications(notificationIds)
    const deliveries = found.map(({ guardianId, notification }): Delivery => ({
      ...describeNotification(notification),
      guardianId,
      notification,
    }))
    await Promise.all(
      deliveries.flatMap((delivery) =>
        channels.map(async ({ name, send }) => {
          try {
            await send(delivery)
          } catch (error) {
            console.error(`Notification channel ${name} failed:`, error)
          }
        }),
      ),
    )
  } catch (error) {
    console.error('Could not deliver notifications:', error)
  }
}
