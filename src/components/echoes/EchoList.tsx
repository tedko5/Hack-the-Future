import { Link } from '@tanstack/react-router'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import type { ShapeKind } from '#/components/ui/Shape.tsx'
import type { Echo } from '#/lib/echo.ts'
import { TIME_ZONE } from '#/lib/formatDate.ts'

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE })
const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE })

/** Grid shared by day markers and echoes: time | ley line | content. */
const ROW = 'relative grid grid-cols-[3rem_1.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[3.5rem_1.5rem_minmax(0,1fr)] sm:gap-x-4'

type Props = {
  echoes: Echo[]
  onReport: () => void
  reportLabel?: string
}

export function EchoList({ echoes, onReport, reportLabel = 'Report echo' }: Props) {
  return (
    <section aria-labelledby="echoes-title" className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="echoes-title" className="font-display text-[1.6rem] font-bold">
          Echoes
          <span className="ml-2 font-sans text-base font-normal text-muted tabular-nums">{echoes.length}</span>
        </h2>
        <button
          type="button"
          onClick={onReport}
          className="min-h-12 w-full cursor-pointer rounded-xl bg-copper px-5.5 py-3 font-bold text-[#1a0f08] hover:brightness-110 sm:w-auto"
        >
          {reportLabel}
        </button>
      </div>

      <div className="rounded-xl border-2 border-edge bg-well px-3 py-4 sm:px-6 sm:py-5">
        {echoes.length === 0 ? (
          <p className="text-muted">No echoes reported yet.</p>
        ) : (
          <ol>
            {groupByDay(echoes).map(({ day, items }) => (
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
    </section>
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
  const status = STATUS_STYLES[echo.glitch.status]

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
            className="tabular-nums hover:text-cyan"
          >
            {echo.glitch.glitchId}
          </Link>
          <span>
            <span className="text-fg">{echo.reporter.codename}</span>
            <span className="ml-1.5">{echo.reporter.role}</span>
          </span>
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
