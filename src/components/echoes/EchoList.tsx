import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { EchoActions } from '#/components/echoes/EchoActions.tsx'
import { GuardianLink } from '#/components/guardians/GuardianLink.tsx'
import { CollapsibleSection } from '#/components/ui/CollapsibleSection.tsx'
import { ListControls } from '#/components/ui/ListControls.tsx'
import { ShowMore, useShowMore } from '#/components/ui/ShowMore.tsx'
import type { ShapeKind } from '#/components/ui/Shape.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import type { Echo } from '#/lib/schemas/echo.ts'
import { isToday } from '#/lib/utils/formatDate.ts'
import { matchesSearch } from '#/lib/utils/search.ts'
import { useStoredFlag } from '#/lib/hooks/useStoredFlag.ts'

/** Grid shared by day markers and echoes: time | ley line | content. */
const ROW = 'relative grid grid-cols-[3rem_1.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[3.5rem_1.5rem_minmax(0,1fr)] sm:gap-x-4'

type Props = {
  /** Newest first. */
  echoes: Echo[]
  storageKey: string
  onReport: () => void
  reportLabel?: string
  /** Offers to show only today's echoes. */
  canFilterToday?: boolean
}

export function EchoList({
  echoes: allEchoes,
  storageKey,
  onReport,
  reportLabel,
  canFilterToday = false,
}: Props) {
  const t = useT()
  const format = useFormat()
  const [wantsToday, setWantsToday] = useStoredFlag(`today-only:${storageKey}`, true)
  const isTodayOnly = canFilterToday && wantsToday
  const echoes = isTodayOnly ? allEchoes.filter((echo) => isToday(echo.timestamp)) : allEchoes
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<keyof typeof t.echoes.sorts>('newest')
  const sorted = sort === 'newest' ? echoes : echoes.toReversed()
  const found = sorted.filter((echo) =>
    matchesSearch(
      query,
      echo.description,
      echo.glitch.glitchId,
      t.status[echo.status],
      echo.reporter.codename,
      echo.reporter.role,
    ),
  )
  const { visible, showMore } = useShowMore(found)
  // Without the filter, as on a glitch page, there is nothing to tell apart.
  const title = !canFilterToday ? t.echoes.title : isTodayOnly ? t.echoes.today : t.echoes.all
  const emptyMessage =
    echoes.length > 0
      ? t.echoes.noMatch
      : isTodayOnly
        ? t.echoes.noneToday
        : t.echoes.none
  const actions = (
    <div className="flex w-full items-center gap-5 sm:w-auto">
      {canFilterToday && (
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2.5 text-sm text-muted hover:text-fg">
          <input
            type="checkbox"
            className="size-4.5 cursor-pointer accent-violet"
            checked={wantsToday}
            onChange={(event) => setWantsToday(event.target.checked)}
          />
          {t.echoes.onlyToday}
        </label>
      )}
      <button
        type="button"
        onClick={onReport}
        className="min-h-12 flex-1 cursor-pointer rounded-xl bg-copper px-5.5 py-3 font-bold text-on-copper hover:brightness-110 sm:flex-none"
      >
        {reportLabel ?? t.echoes.report}
      </button>
    </div>
  )

  return (
    <CollapsibleSection
      title={title}
      count={echoes.length}
      storageKey={storageKey}
      action={actions}
    >
      {echoes.length > 0 && (
        <div className="mb-4">
          <ListControls
            searchLabel={t.echoes.search}
            query={query}
            onQueryChange={setQuery}
            sorts={t.echoes.sorts}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
      )}
      <div className="tech-frame rounded-xl border-2 border-edge bg-well px-3 py-4 sm:px-6 sm:py-5">
        {found.length === 0 ? (
          <p className="text-muted">
            {emptyMessage}
          </p>
        ) : (
          <ol>
            {groupByDay(visible, format.day).map(({ day, items }) => (
              <li key={day}>
                <DayMarker day={day} />
                <ol>
                  {items.map((echo) => (
                    <EchoEntry key={echo.echoId} echo={echo} />
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </div>
      <ShowMore {...showMore} />
    </CollapsibleSection>
  )
}

function groupByDay(echoes: Echo[], formatDay: (isoTimestamp: string) => string) {
  const days: { day: string; items: Echo[] }[] = []
  for (const echo of echoes) {
    const day = formatDay(echo.timestamp)
    const last = days.at(-1)
    if (last?.day === day) last.items.push(echo)
    else days.push({ day, items: [echo] })
  }
  return days
}

/** The ley line itself: one segment per row, so the rows join into one unbroken line. */
function LeyLine() {
  return <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-ley" />
}

function DayMarker({ day }: { day: string }) {
  return (
    <div className={ROW}>
      <span />
      <span className="relative flex justify-center pt-1">
        <LeyLine />
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="relative">
          <rect x="2" y="2" width="10" height="10" transform="rotate(45 7 7)" className="fill-well stroke-edge-hover" strokeWidth="1.5" />
        </svg>
      </span>
      <h3 className="pb-3 font-display text-lg font-bold text-soft">{day}</h3>
    </div>
  )
}

function EchoEntry({ echo }: { echo: Echo }) {
  const t = useT()
  const format = useFormat()
  const status = STATUS_STYLES[echo.status]

  return (
    <li className={ROW}>
      <time dateTime={echo.timestamp} className="pt-0.5 text-right text-sm text-muted tabular-nums">
        {format.time(echo.timestamp)}
      </time>
      <span className="relative flex justify-center">
        <LeyLine />
        <Rune kind={status.shape} color={status.color} />
      </span>
      <div className="min-w-0 pb-6">
        <p className="leading-snug break-words">{echo.description}</p>
        {echo.hasImage && (
          <a
            href={`/api/echo-images/${echo.echoId}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block w-fit"
          >
            {/* Fixed height, so the timeline does not jump when the image loads. */}
            <img
              src={`/api/echo-images/${echo.echoId}`}
              alt={t.echoes.imageBy(echo.reporter.codename)}
              loading="lazy"
              className="h-40 max-w-full rounded-lg object-contain"
            />
          </a>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[.85rem] text-muted">
          <span className="font-medium" style={{ color: status.color }}>
            {t.status[echo.status]}
          </span>
          <Link
            to="/glitches/$glitchId"
            params={{ glitchId: echo.glitch.glitchId }}
            className="clickable tabular-nums"
          >
            {echo.glitch.glitchId}
          </Link>
          <span>
            <GuardianLink {...echo.reporter} />
            <span className="ml-1.5">{echo.reporter.role}</span>
          </span>
          {echo.newStatus && <span>{t.echoes.statusChanged}</span>}
          {echo.isEdited && <span>{t.echoes.edited}</span>}
          <EchoActions echo={echo} />
        </div>
      </div>
    </li>
  )
}

/** Carved rune where an echo joins the ley line: the status shape, outlined with a solid core. */
function Rune({ kind, color }: { kind: ShapeKind; color: string }) {
  const outer = { className: 'fill-well', stroke: 'currentColor', strokeWidth: 1.75, strokeLinejoin: 'round' as const }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="relative mt-px" style={{ color }}>
      {kind === 'circle' && (
        <>
          <circle cx="11" cy="11" r="9" {...outer} />
          <circle cx="11" cy="11" r="4" fill="currentColor" />
        </>
      )}
      {kind === 'diamond' && (
        <>
          <polygon points="11,1.5 20.5,11 11,20.5 1.5,11" {...outer} />
          <polygon points="11,6.5 15.5,11 11,15.5 6.5,11" fill="currentColor" />
        </>
      )}
      {kind === 'square' && (
        <>
          <rect x="2.5" y="2.5" width="17" height="17" rx="2" {...outer} />
          <rect x="7.5" y="7.5" width="7" height="7" rx="1" fill="currentColor" />
        </>
      )}
      {kind === 'triangle' && (
        <>
          <polygon points="11,2 20.5,19 1.5,19" {...outer} />
          <polygon points="11,9 14.5,15.5 7.5,15.5" fill="currentColor" />
        </>
      )}
    </svg>
  )
}
