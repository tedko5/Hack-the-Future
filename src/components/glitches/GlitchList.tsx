import { Link } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { GlitchStatusLabel } from '#/components/glitches/GlitchStatusLabel.tsx'
import { CollapsibleSection } from '#/components/ui/CollapsibleSection.tsx'
import { ListControls } from '#/components/ui/ListControls.tsx'
import { ShowMore, useShowMore } from '#/components/ui/ShowMore.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import type { Glitch } from '#/lib/schemas/glitch.ts'
import { sortGlitches, type GlitchSort } from '#/lib/utils/glitchSort.ts'
import { matchesSearch } from '#/lib/utils/search.ts'

type Props = {
  title: string
  glitches: Glitch[]
  emptyMessage: string
  storageKey: string
  isSearchable?: boolean
  action?: ReactNode
}

export function GlitchList({
  title,
  glitches,
  emptyMessage,
  storageKey,
  isSearchable = false,
  action,
}: Props) {
  const t = useT()
  const format = useFormat()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<GlitchSort>('newest')
  const found = sortGlitches(glitches, sort).filter((glitch) =>
    matchesSearch(
      query,
      glitch.glitchId,
      glitch.description,
      t.status[glitch.status],
      glitch.assignedCodename ?? t.common.unassigned,
    ),
  )

  const { visible, showMore } = useShowMore(found)

  return (
    <CollapsibleSection title={title} count={glitches.length} storageKey={storageKey} action={action}>
      {isSearchable && glitches.length > 0 && (
        <div className="mb-4">
          <ListControls
            searchLabel={t.glitches.search}
            query={query}
            onQueryChange={setQuery}
            sorts={t.glitches.sorts}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
      )}
      {found.length === 0 ? (
        <p className="rounded-xl border-2 border-edge bg-well p-4 text-muted">
          {glitches.length === 0 ? emptyMessage : t.glitches.noMatch}
        </p>
      ) : (
        <ul className="tech-frame divide-y divide-line overflow-hidden rounded-xl border-2 border-edge bg-well">
          {visible.map((glitch) => (
            <li key={glitch.glitchId}>
              <Link
                to="/glitches/$glitchId"
                params={{ glitchId: glitch.glitchId }}
                className="grid gap-x-4 gap-y-1 px-4 py-3 -outline-offset-2 hover:bg-row sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <GlitchStatusLabel status={glitch.status} />
                <span className="min-w-0 leading-snug break-words">{glitch.description}</span>
                <span className="text-[.85rem] text-muted tabular-nums sm:text-right">
                  <span className="clickable text-fg">{glitch.glitchId}</span>
                  <span className="ml-3 sm:ml-0 sm:block">{glitch.assignedCodename ?? t.common.unassigned}</span>
                  <time dateTime={glitch.timestamp} className="ml-3 sm:ml-0 sm:block">
                    {format.dateTime(glitch.timestamp)}
                  </time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ShowMore {...showMore} />
    </CollapsibleSection>
  )
}
