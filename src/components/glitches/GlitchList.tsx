import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { GlitchStatusLabel } from '#/components/glitches/GlitchStatusLabel.tsx'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { CollapsibleSection } from '#/components/ui/CollapsibleSection.tsx'
import { SearchInput } from '#/components/ui/SearchInput.tsx'
import { formatDateTime } from '#/lib/formatDate.ts'
import type { Glitch } from '#/lib/glitch.ts'
import { matchesSearch } from '#/lib/search.ts'

type Props = {
  title: string
  glitches: Glitch[]
  emptyMessage: string
  storageKey: string
  isSearchable?: boolean
}

export function GlitchList({ title, glitches, emptyMessage, storageKey, isSearchable = false }: Props) {
  const [query, setQuery] = useState('')
  const found = glitches.filter((glitch) =>
    matchesSearch(
      query,
      glitch.glitchId,
      glitch.description,
      STATUS_STYLES[glitch.status].label,
      glitch.assignedCodename ?? 'Unassigned',
    ),
  )

  return (
    <CollapsibleSection title={title} count={glitches.length} storageKey={storageKey}>
      {isSearchable && glitches.length > 0 && (
        <div className="mb-4">
          <SearchInput label="Search glitches" value={query} onChange={setQuery} />
        </div>
      )}
      {found.length === 0 ? (
        <p className="rounded-xl border-2 border-edge bg-well p-4 text-muted">
          {glitches.length === 0 ? emptyMessage : 'No glitches match your search.'}
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border-2 border-edge bg-well">
          {found.map((glitch) => (
            <li key={glitch.glitchId}>
              <Link
                to="/glitches/$glitchId"
                params={{ glitchId: glitch.glitchId }}
                className="grid gap-x-4 gap-y-1 px-4 py-3 -outline-offset-2 hover:bg-row sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <GlitchStatusLabel status={glitch.status} />
                <span className="min-w-0 leading-snug break-words">{glitch.description}</span>
                <span className="text-[.85rem] text-muted tabular-nums sm:text-right">
                  <span className="text-fg">{glitch.glitchId}</span>
                  <span className="ml-3 sm:ml-0 sm:block">{glitch.assignedCodename ?? 'Unassigned'}</span>
                  <time dateTime={glitch.timestamp} className="ml-3 sm:ml-0 sm:block">
                    {formatDateTime(glitch.timestamp)}
                  </time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CollapsibleSection>
  )
}
