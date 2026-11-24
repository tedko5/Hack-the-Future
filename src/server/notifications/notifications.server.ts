import { and, count, desc, eq, inArray, isNull, sql } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { glitches, guardians, notifications } from '#/db/schema.ts'
import type { Notification } from '#/lib/notification.ts'

const PAGE_SIZE = 50

const selectNotifications = () =>
  db
    .select({
      guardianId: notifications.guardianId,
      notificationId: notifications.notificationId,
      type: notifications.type,
      actorCodename: guardians.codename,
      glitchId: notifications.glitchId,
      glitchDescription: glitches.description,
      conversationId: notifications.conversationId,
      detail: notifications.detail,
      createdAt: notifications.createdAt,
      readAt: notifications.readAt,
    })
    .from(notifications)
    .innerJoin(guardians, eq(guardians.guardianId, notifications.actorId))
    .leftJoin(glitches, eq(glitches.glitchId, notifications.glitchId))

type NotificationRow = Awaited<ReturnType<typeof selectNotifications>>[number]

function toNotification(row: NotificationRow): Notification {
  const { notificationId, type, actorCodename, conversationId, detail } = row
  return {
    notificationId,
    type,
    actorCodename,
    glitch:
      row.glitchId === null
        ? null
        : { glitchId: row.glitchId, description: row.glitchDescription ?? '' },
    conversationId,
    detail,
    createdAt: row.createdAt.toISOString(),
    isRead: row.readAt !== null,
  }
}

const unreadOf = (guardianId: string) =>
  and(eq(notifications.guardianId, guardianId), isNull(notifications.readAt))

/** The latest ones, newest first. */
export async function listNotifications(guardianId: string): Promise<Notification[]> {
  const rows = await selectNotifications()
    .where(eq(notifications.guardianId, guardianId))
    .orderBy(desc(notifications.notificationId))
    .limit(PAGE_SIZE)
  return rows.map(toNotification)
}

/** For delivery, with their recipients. */
export async function findNotifications(notificationIds: number[]) {
  const rows = await selectNotifications().where(
    inArray(notifications.notificationId, notificationIds),
  )
  return rows.map((row) => ({ guardianId: row.guardianId, notification: toNotification(row) }))
}

export async function summarizeUnread(guardianId: string) {
  const [[{ unread }], [latest]] = await Promise.all([
    db.select({ unread: count() }).from(notifications).where(unreadOf(guardianId)),
    selectNotifications()
      .where(unreadOf(guardianId))
      .orderBy(desc(notifications.notificationId))
      .limit(1),
  ])
  return { unread, latest: latest ? toNotification(latest) : null }
}

export async function markNotificationRead(guardianId: string, notificationId: number) {
  await db
    .update(notifications)
    .set({ readAt: sql`now()` })
    .where(and(unreadOf(guardianId), eq(notifications.notificationId, notificationId)))
}

export async function markAllNotificationsRead(guardianId: string) {
  await db
    .update(notifications)
    .set({ readAt: sql`now()` })
    .where(unreadOf(guardianId))
}

/** For when the guardian reads the conversation itself. */
export async function markConversationNotificationsRead(
  guardianId: string,
  conversationId: string,
) {
  await db
    .update(notifications)
    .set({ readAt: sql`now()` })
    .where(and(unreadOf(guardianId), eq(notifications.conversationId, conversationId)))
}
