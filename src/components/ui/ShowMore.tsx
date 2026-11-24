import { useRef, useState } from 'react'
import { useT } from '#/i18n/index.ts'

const PAGE_SIZE = 10

/** The first page of a list, and the props for its ShowMore buttons. Search and sort the list first. */
export function useShowMore<Item>(items: Item[]) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  return {
    visible: items.slice(0, limit),
    showMore: {
      shown: Math.min(limit, items.length),
      total: items.length,
      onMore: () => setLimit(limit + PAGE_SIZE),
      onLess: () => setLimit(PAGE_SIZE),
    },
  }
}

type Props = ReturnType<typeof useShowMore>['showMore']

/** Nothing when the list fits on one page. */
export function ShowMore({ shown, total, onMore, onLess }: Props) {
  const t = useT()
  const row = useRef<HTMLDivElement>(null)
  if (total <= PAGE_SIZE) return null

  return (
    // The scroll margin keeps it clear of the bars at the top and bottom.
    <div ref={row} className="mt-3 flex scroll-my-24 flex-wrap items-center justify-center gap-2 text-sm">
      {shown < total && (
        <button type="button" className={buttonClass} onClick={onMore}>
          {t.common.showMore}
        </button>
      )}
      {shown > PAGE_SIZE && (
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            onLess()
            // The page just got shorter: stay at this list.
            requestAnimationFrame(() => row.current?.scrollIntoView({ block: 'nearest' }))
          }}
        >
          {t.common.showLess}
        </button>
      )}
      <span className="px-2 text-muted tabular-nums">{t.common.shown(shown, total)}</span>
    </div>
  )
}

const buttonClass =
  'min-h-11 cursor-pointer rounded-xl border-2 border-edge px-4 text-soft hover:border-edge-hover hover:text-highlight'
