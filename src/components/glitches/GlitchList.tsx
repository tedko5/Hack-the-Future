import { Link } from '@tanstack/react-router'
import { useId } from 'react'
import { GlitchStatusLabel } from '#/components/glitches/GlitchStatusLabel.tsx'
import { formatDateTime } from '#/lib/formatDate.ts'
import type { Glitch } from '#/lib/glitch.ts'

type Props = {
  title: string
  glitches: Glitch[]
  emptyMessage: string
}

export function GlitchList({ title, glitches, emptyMessage }: Props) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5">
      <h2 id={titleId} className="font-display text-[1.6rem] font-bold">
        {title}
        <span className="ml-2 font-sans text-base font-normal text-muted tabular-nums">{glitches.length}</span>
      </h2>

      {glitches.length === 0 ? (
        <p className="rounded-xl border-2 border-edge bg-well p-4 text-muted">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border-2 border-edge bg-well">
          {glitches.map((glitch) => (
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
    </section>
  )
}
