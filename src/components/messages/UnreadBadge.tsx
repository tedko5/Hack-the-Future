import { useT } from '#/i18n/index.ts'

export function UnreadBadge({ count }: { count: number }) {
  const t = useT()
  if (count === 0) return null
  return (
    <span className="rounded-full bg-copper px-2 py-0.5 text-xs font-bold text-on-copper tabular-nums">
      {count}
      <span className="sr-only"> {t.common.unread}</span>
    </span>
  )
}
