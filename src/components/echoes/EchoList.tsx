import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { GuardianLink } from '#/components/guardians/GuardianLink.tsx'
import { CollapsibleSection } from '#/components/ui/CollapsibleSection.tsx'
import { SearchInput } from '#/components/ui/SearchInput.tsx'
import type { ShapeKind } from '#/components/ui/Shape.tsx'
import type { Echo } from '#/lib/echo.ts'
import { TIME_ZONE, isToday } from '#/lib/formatDate.ts'
import { matchesSearch } from '#/lib/search.ts'
import { useStoredFlag } from '#/lib/useStoredFlag.ts'

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE })
const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE })

/** Grid shared by day markers and echoes: time | ley line | content. */
const ROW = 'relative grid grid-cols-[3rem_1.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[3.5rem_1.5rem_minmax(0,1fr)] sm:gap-x-4'

type Props = {
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
  reportLabel = 'Report echo',
  canFilterToday = false,
}: Props) {
  const [wantsToday, setWantsToday] = useStoredFlag(`today-only:${storageKey}`, true)
  const isTodayOnly = canFilterToday && wantsToday
  const echoes = isTodayOnly ? allEchoes.filter((echo) => isToday(echo.timestamp)) : allEchoes
  const [query, setQuery] = useState('')
  const found = echoes.filter((echo) =>
    matchesSearch(
      query,
      echo.description,
      echo.glitch.glitchId,
      STATUS_STYLES[echo.status].label,
      echo.reporter.codename,
      echo.reporter.role,
    ),
  )
  const emptyMessage =
    echoes.length > 0
      ? 'No echoes match your search.'
      : isTodayOnly
        ? 'No whispers yet today.'
        : 'No echoes reported yet.'
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
          Only today
        </label>
      )}
      <button
        type="button"
        onClick={onReport}
        className="min-h-12 flex-1 cursor-pointer rounded-xl bg-copper px-5.5 py-3 font-bold text-[#1a0f08] hover:brightness-110 sm:flex-none"
      >
        {reportLabel}
      </button>
    </div>
  )

  return (
    <CollapsibleSection
      title={isTodayOnly ? 'Whispers of today' : 'Echoes'}
      count={echoes.length}
      storageKey={storageKey}
      action={actions}
    >
      {echoes.length > 0 && (
        <div className="mb-4">
          <SearchInput label="Search echoes" value={query} onChange={setQuery} />
        </div>
      )}
      <div className="rounded-xl border-2 border-edge bg-well px-3 py-4 sm:px-6 sm:py-5">
        {found.length === 0 ? (
          <p className="text-muted">
            {emptyMessage}
          </p>
        ) : (
          <ol>
            {groupByDay(found).map(({ day, items }) => (
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
    </CollapsibleSection>
  )
}

function groupByDay(echoes: Echo[]) {
  const days: { day: string; items: Echo[] }[] = []
  for (const echo of echoes) {
    const day = dayFormat.format(new Date(echo.timestamp))
    const last = days.at(-1)
    if (last?.day === day) last.items.push(echo)
    else days.push({ day, items: [echo] })
  }
  return days
}

/** The ley line itself: one segment per row, so the rows join into one unbroken line. */
function LeyLine() {
  return <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#4a3a9e]" />
}

function DayMarker({ day }: { day: string }) {
  return (
    <div className={ROW}>
      <span />
      <span className="relative flex justify-center pt-1">
        <LeyLine />
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="relative">
          <rect x="2" y="2" width="10" height="10" transform="rotate(45 7 7)" fill="#141527" stroke="#7d6ad6" strokeWidth="1.5" />
        </svg>
      </span>
      <h3 className="pb-3 font-display text-lg font-bold text-[#b9c0e6]">{day}</h3>
    </div>
  )
}

function EchoEntry({ echo }: { echo: Echo }) {
  const status = STATUS_STYLES[echo.status]

  return (
    <li className={ROW}>
      <time dateTime={echo.timestamp} className="pt-0.5 text-right text-sm text-muted tabular-nums">
        {timeFormat.format(new Date(echo.timestamp))}
      </time>
      <span className="relative flex justify-center">
        <LeyLine />
        <Rune kind={status.shape} color={status.color} />
      </span>
      <div className="min-w-0 pb-6">
        <p className="leading-snug">{echo.description}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[.85rem] text-muted">
          <span className="font-medium" style={{ color: status.color }}>
            {status.label}
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
          {echo.newStatus && <span>Status changed</span>}
        </p>
      </div>
    </li>
  )
}

/** Carved rune where an echo joins the ley line: the status shape, outlined with a solid core. */
function Rune({ kind, color }: { kind: ShapeKind; color: string }) {
  const outer = { fill: '#141527', stroke: color, strokeWidth: 1.75, strokeLinejoin: 'round' as const }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="relative mt-px">
      {kind === 'circle' && (
        <>
          <circle cx="11" cy="11" r="9" {...outer} />
          <circle cx="11" cy="11" r="4" fill={color} />
        </>
      )}
      {kind === 'diamond' && (
        <>
          <polygon points="11,1.5 20.5,11 11,20.5 1.5,11" {...outer} />
          <polygon points="11,6.5 15.5,11 11,15.5 6.5,11" fill={color} />
        </>
      )}
      {kind === 'square' && (
        <>
          <rect x="2.5" y="2.5" width="17" height="17" rx="2" {...outer} />
          <rect x="7.5" y="7.5" width="7" height="7" rx="1" fill={color} />
        </>
      )}
      {kind === 'triangle' && (
        <>
          <polygon points="11,2 20.5,19 1.5,19" {...outer} />
          <polygon points="11,9 14.5,15.5 7.5,15.5" fill={color} />
        </>
      )}
    </svg>
  )
}
