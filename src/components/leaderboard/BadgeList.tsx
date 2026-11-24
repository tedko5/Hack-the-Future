import { Crown, Ear, MessageCircle, ShieldCheck, Sparkles, Zap, type LucideIcon } from 'lucide-react'
import { useT } from '#/i18n/index.ts'
import type { Badge } from '#/lib/schemas/leaderboard.ts'

const ICONS: Record<Badge['id'], LucideIcon> = {
  'first-whisper': MessageCircle,
  'keen-ear': Ear,
  'rift-sealer': ShieldCheck,
  'ward-weaver': Sparkles,
  'grid-master': Crown,
  'swift-hand': Zap,
}

type Props = {
  badges: Badge[]
  /** Icons only on phones, so a row of badges fits on one line. The name stays for hover and screen readers. */
  compact?: boolean
}

export function BadgeList({ badges, compact = false }: Props) {
  const t = useT()
  if (badges.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5">
      {badges.map(({ id }) => {
        const Icon = ICONS[id]
        const { label, description } = t.leaderboard.badges[id]
        return (
          <li
            key={id}
            title={description}
            className={`flex items-center gap-1.5 rounded-full border border-edge bg-row py-1 text-xs ${
              compact ? 'px-1.5 sm:px-2.5' : 'px-2.5'
            }`}
          >
            <Icon size={14} aria-hidden="true" className="shrink-0 text-copper" />
            <span className={compact ? 'sr-only sm:not-sr-only' : undefined}>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}
