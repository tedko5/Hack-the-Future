import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronUp, MapPin, ShieldAlert, Sparkles, Terminal } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { z } from 'zod'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { GlitchStatusLabel } from '#/components/glitches/GlitchStatusLabel.tsx'
import { AchronaMap, type MapGlitch } from '#/components/map/AchronaMap.tsx'
import { HackTerminal } from '#/components/map/HackTerminal.tsx'
import { Shape } from '#/components/ui/Shape.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import { getDashboard } from '#/lib/dashboard.functions.ts'
import { desyncStateFor } from '#/lib/desync.ts'
import { GLITCH_STATUSES, canHack, type GlitchStatus } from '#/lib/glitch.ts'
import { magicLevel } from '#/lib/magic.ts'
import { placeGlitches } from '#/lib/map.ts'

export const Route = createFileRoute('/_app/map')({
  validateSearch: z.object({ glitch: z.string().optional() }),
  loader: () => getDashboard(),
  component: MapPage,
})

/** How many of the newest echoes the side panel lists. */
const RECENT_ECHOES = 3

function MapPage() {
  const t = useT()
  const format = useFormat()
  const { magic, glitches, echoes } = Route.useLoaderData()
  const { guardian } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [hidden, setHidden] = useState<GlitchStatus[]>([])
  const [flashId, setFlashId] = useState<string>()
  /** The glitch whose hacking terminal is open. */
  const [hackingId, setHackingId] = useState<string>()
  const isCommander = guardian.role === 'commander'

  // Placed from all glitches, so hiding a status never moves the others.
  const placed = useMemo<MapGlitch[]>(() => {
    const places = placeGlitches(glitches)
    return glitches.map((glitch) => ({
      ...glitch,
      ...places.get(glitch.glitchId)!,
      echoes: echoes.filter((echo) => echo.glitch.glitchId === glitch.glitchId),
    }))
  }, [glitches, echoes])
  const visible = placed.filter((glitch) => !hidden.includes(glitch.status))
  // Without a choice, the newest open glitch is the one to look at.
  const selected =
    placed.find((glitch) => glitch.glitchId === search.glitch) ??
    placed.find((glitch) => glitch.status !== 'FIXED')

  const select = (glitchId: string) =>
    void navigate({ search: { glitch: glitchId }, replace: true, resetScroll: false })

  const toggle = (status: GlitchStatus) =>
    setHidden((current) =>
      current.includes(status) ? current.filter((s) => s !== status) : [...current, status],
    )

  const hackTarget = placed.find((glitch) => glitch.glitchId === hackingId)

  return (
    <section
      aria-labelledby="map-title"
      className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="map-title" className="font-display text-[1.6rem] font-bold">
            {t.map.title}
          </h2>
          <p className="text-sm text-muted">{t.map.intro}</p>
        </div>
        <MagicMeter magic={magic} />
      </div>

      <div
        className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 md:flex-wrap md:overflow-visible"
        role="group"
        aria-label={t.map.showStatuses}
      >
        {GLITCH_STATUSES.map((status) => {
          const { shape, color } = STATUS_STYLES[status]
          const count = placed.filter((glitch) => glitch.status === status).length
          const isShown = !hidden.includes(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={isShown}
              onClick={() => toggle(status)}
              className={`flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 px-3.5 text-sm ${
                isShown ? 'border-edge bg-well text-fg' : 'border-line text-muted line-through opacity-60'
              } hover:border-edge-hover`}
            >
              <Shape kind={shape} color={color} />
              {t.status[status]}
              <span className="text-muted tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="map-frame tech-frame overflow-hidden rounded-xl border-2 border-edge bg-well">
            <AchronaMap
              glitches={visible}
              selectedId={selected?.glitchId}
              onSelect={select}
              flashId={flashId}
            />
          </div>
          <GlitchChips glitches={visible} selectedId={selected?.glitchId} onSelect={select} />
        </div>

        <aside
          id="glitch-details"
          aria-label={t.map.selected}
          className="tech-frame flex scroll-mt-4 flex-col gap-4 rounded-xl border-2 border-edge bg-well p-4"
        >
          {selected ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">{selected.glitchId}</h3>
                  <GlitchStatusLabel status={selected.status} />
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <MapPin size={15} aria-hidden="true" />
                  {t.map.districts[selected.district.id]}
                </p>
                <p className="leading-snug break-words">{selected.description}</p>
                <p className="text-[.85rem] text-muted">
                  {selected.assignedCodename ?? t.common.unassigned} ·{' '}
                  <time dateTime={selected.timestamp}>{format.dateTime(selected.timestamp)}</time>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-soft">
                  {selected.echoes.length} {t.leaderboard.echoes(selected.echoes.length)}
                </h4>
                <ul className="flex flex-col gap-2">
                  {selected.echoes.slice(0, RECENT_ECHOES).map((echo) => (
                    <li key={echo.echoId} className="flex gap-2.5 text-sm">
                      <span className="mt-1">
                        <Shape kind={STATUS_STYLES[echo.status].shape} color={STATUS_STYLES[echo.status].color} size={10} />
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 break-words">{echo.description}</span>
                        <span className="block text-[.8rem] text-muted">
                          {echo.reporter.codename} · {format.dateTime(echo.timestamp)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/glitches/$glitchId"
                  params={{ glitchId: selected.glitchId }}
                  className="flex min-h-11 items-center gap-1.5 self-start text-sm text-muted hover:text-highlight"
                >
                  <span className="clickable">{t.map.openGlitch}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              {isCommander && (
                // On phones the bar at the bottom has it, always in reach.
                <div className="hidden md:block">
                  <HackStatus glitch={selected} onOpen={() => setHackingId(selected.glitchId)} />
                </div>
              )}
            </>
          ) : (
            <p className="text-muted">{t.map.noneOpen}</p>
          )}
        </aside>
      </div>
      {selected && (
        <MobileGlitchBar
          glitch={selected}
          canHackHere={isCommander}
          onHack={() => setHackingId(selected.glitchId)}
        />
      )}
      {hackTarget && (
        <HackTerminal
          key={hackTarget.glitchId}
          glitch={hackTarget}
          magic={magic}
          magicIfFixed={magicLevel(
            glitches.map((glitch) =>
              glitch.glitchId === hackTarget.glitchId ? 'FIXED' : glitch.status,
            ),
          )}
          onFixed={() => setFlashId(hackTarget.glitchId)}
          onClose={() => setHackingId(undefined)}
        />
      )}
    </section>
  )
}

const METER_SEGMENTS = 12

/**
 * Magic as twelve rune segments that go dark as it drains, like the cracking ring of the
 * Desync Well on mission control.
 */
function MagicMeter({ magic }: { magic: number }) {
  const t = useT()
  const state = desyncStateFor(magic)
  const lit = Math.round((magic / 100) * METER_SEGMENTS)
  const vars = { '--st': `var(--desync-${state})`, '--st-soft': `var(--desync-${state}-soft)` } as CSSProperties
  return (
    <div className="flex min-w-52 flex-col gap-2" style={vars}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="readout-glow font-display text-base font-bold">{t.magic.states[state]}</span>
        <span className="readout-glow font-display text-2xl leading-none font-bold tabular-nums">
          {magic}
          <span className="ml-0.5 text-[.55em] text-muted [text-shadow:none]">%</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={t.magic.title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={magic}
        className="flex gap-1"
      >
        {Array.from({ length: METER_SEGMENTS }, (_, index) => (
          <span key={index} className={`rune-segment ${index < lit ? 'is-lit' : ''}`} />
        ))}
      </div>
    </div>
  )
}

/** What is left to do with hacking on this glitch. */
function HackStatus({ glitch, onOpen }: { glitch: MapGlitch; onOpen: () => void }) {
  const t = useT()
  if (glitch.hackResult === 'FAILED') {
    return (
      <p className="flex items-start gap-2.5 rounded-xl border-2 border-(--status-leaked) bg-well px-4 py-3 text-sm">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-(--status-leaked)" aria-hidden="true" />
        <span>
          <b className="text-(--status-leaked)">{t.hack.manual}</b>{' '}
          <span className="text-muted">{t.hack.failed}</span>
        </span>
      </p>
    )
  }
  if (glitch.hackResult === 'SUCCESS') {
    return (
      <p className="flex items-center gap-2 text-sm text-(--status-fixed)">
        <Sparkles size={16} aria-hidden="true" /> {t.hack.fixed}
      </p>
    )
  }
  if (glitch.status === 'FIXED') return null
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onOpen}
        className="hack-button flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-5"
      >
        <Terminal size={18} aria-hidden="true" />
        {t.hack.open}
      </button>
      <p className="text-[.8rem] text-muted">{t.hack.hint}</p>
    </div>
  )
}

/** On phones: swipe the map, or tap a glitch here. Markers are small at that size. */
function GlitchChips({
  glitches,
  selectedId,
  onSelect,
}: {
  glitches: MapGlitch[]
  selectedId: string | undefined
  onSelect: (glitchId: string) => void
}) {
  const t = useT()
  return (
    <div className="flex flex-col gap-2 md:hidden">
      <p className="text-[.8rem] text-muted">{t.map.swipe}</p>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {glitches.map((glitch) => {
          const { shape, color } = STATUS_STYLES[glitch.status]
          const isSelected = glitch.glitchId === selectedId
          return (
            <button
              key={glitch.glitchId}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(glitch.glitchId)}
              className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 px-3.5 text-sm ${
                isSelected ? 'border-highlight bg-well font-bold' : 'border-edge text-soft'
              }`}
            >
              <Shape kind={shape} color={color} />
              {glitch.glitchId}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * On phones, pinned above the tab bar: the selected glitch and its hack button stay in reach
 * while you explore the map. Tapping it scrolls to the full details.
 */
function MobileGlitchBar({
  glitch,
  canHackHere,
  onHack,
}: {
  glitch: MapGlitch
  canHackHere: boolean
  onHack: () => void
}) {
  const t = useT()
  const { shape, color } = STATUS_STYLES[glitch.status]
  const showDetails = () =>
    document.getElementById('glitch-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      {/* Keeps the end of the page clear of the bar. */}
      <div aria-hidden="true" className="h-14 md:hidden" />
      <div className="fixed inset-x-0 bottom-[calc(4rem+2px)] z-20 border-t-2 border-edge bg-panel/95 px-3 py-2 backdrop-blur md:hidden print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={showDetails}
            aria-label={`${t.map.showDetails}: ${glitch.glitchId}`}
            className="flex min-h-12 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-left"
          >
            <Shape kind={shape} color={color} size={14} />
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{glitch.glitchId}</span>
              <span className="block truncate text-[.8rem] text-muted">
                {t.status[glitch.status]} · {t.map.districts[glitch.district.id]}
              </span>
            </span>
            <ChevronUp size={18} className="shrink-0 text-muted" aria-hidden="true" />
          </button>
          {canHackHere && <BarAction glitch={glitch} onHack={onHack} />}
        </div>
      </div>
    </>
  )
}

function BarAction({ glitch, onHack }: { glitch: MapGlitch; onHack: () => void }) {
  const t = useT()
  if (canHack(glitch)) {
    return (
      <button
        type="button"
        onClick={onHack}
        className="hack-button flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4"
      >
        <Terminal size={18} aria-hidden="true" />
        {t.hack.openShort}
      </button>
    )
  }
  if (glitch.hackResult === 'FAILED') {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-(--status-leaked) px-2.5 py-1.5 text-[.8rem] font-bold text-(--status-leaked)">
        <ShieldAlert size={15} aria-hidden="true" />
        {t.hack.manualShort}
      </span>
    )
  }
  if (glitch.hackResult === 'SUCCESS') {
    return <Sparkles size={20} className="shrink-0 text-(--status-fixed)" aria-label={t.hack.fixed} />
  }
  return null
}
