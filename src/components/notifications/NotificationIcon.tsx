import {
  ArrowRightLeft,
  CircleAlert,
  MessageCircle,
  MessageSquarePlus,
  Reply,
  Shield,
  SmilePlus,
  UserCheck,
  UserMinus,
  type LucideIcon,
} from 'lucide-react'
import type { NotificationType } from '#/lib/schemas/notification.ts'

const ICONS: Record<NotificationType, LucideIcon> = {
  glitch_reported: CircleAlert,
  glitch_assigned: UserCheck,
  glitch_unassigned: UserMinus,
  glitch_released: UserMinus,
  glitch_updated: MessageSquarePlus,
  glitch_status_changed: ArrowRightLeft,
  message_received: MessageCircle,
  message_replied: Reply,
  message_reacted: SmilePlus,
  role_changed: Shield,
}

export function NotificationIcon({ type }: { type: NotificationType }) {
  const Icon = ICONS[type]
  return <Icon size={20} aria-hidden="true" className="shrink-0 text-violet" />
}
