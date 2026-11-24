export function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="rounded-full bg-copper px-2 py-0.5 text-xs font-bold text-[#1a0f08] tabular-nums">
      {count}
      <span className="sr-only"> unread</span>
    </span>
  )
}
