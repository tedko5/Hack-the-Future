import { Crown, Ear, MessageCircle, ShieldCheck, Sparkles, Zap, type LucideIcon } from 'lucide-react'
import type { Badge } from '#/lib/leaderboard.ts'

const ICONS: Record<Badge['id'], LucideIcon> = {
  'first-whisper': MessageCircle,
  'keen-ear': Ear,
  'rift-sealer': ShieldCheck,
  'ward-weaver': Sparkles,
  'grid-master': Crown,
  'swift-hand': Zap,
}

export function BadgeList({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5">
      {badges.map(({ id, label, description }) => {
        const Icon = ICONS[id]
        return (
          <li
            key={id}
            title={description}
            className="flex items-center gap-1.5 rounded-full border border-edge bg-row px-2.5 py-1 text-xs"
          >
            <Icon size={14} aria-hidden="true" className="text-copper" />
            {label}
          </li>
        )
      })}
    </ul>
  )
}
