import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, MapPin, ShieldAlert, Sparkles, Terminal } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { z } from 'zod'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { GlitchStatusLabel } from '#/components/glitches/GlitchStatusLabel.tsx'
import { AchronaMap, type MapGlitch } from '#/components/map/AchronaMap.tsx'
import { HackTerminal } from '#/components/map/HackTerminal.tsx'
import { Shape } from '#/components/ui/Shape.tsx'
import { getDashboard } from '#/lib/dashboard.functions.ts'
import { DESYNC_STYLES, desyncStateFor } from '#/lib/desync.ts'
import { formatDateTime } from '#/lib/formatDate.ts'
import { GLITCH_STATUSES, type GlitchStatus } from '#/lib/glitch.ts'
import { magicLevel } from '#/lib/magic.ts'
import { locate } from '#/lib/map.ts'

export const Route = createFileRoute('/_app/map')({
  validateSearch: z.object({ glitch: z.string().optional() }),
  loader: () => getDashboard(),
  component: MapPage,
})

/** How many of the newest echoes the side panel lists. */
const RECENT_ECHOES = 3

function MapPage() {
  const { magic, glitches, echoes } = Route.useLoaderData()
  const { guardian } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [hidden, setHidden] = useState<GlitchStatus[]>([])
  const [flashId, setFlashId] = useState<string>()
  /** Without an echoId the terminal hacks in through the glitch itself. */
  const [hacking, setHacking] = useState<{ glitchId: string; echoId?: number }>()
  const isCommander = guardian.role === 'commander'

  const placed = useMemo<MapGlitch[]>(
    () =>
      glitches.map((glitch) => ({
        ...glitch,
        ...locate(glitch),
        echoes: echoes.filter((echo) => echo.glitch.glitchId === glitch.glitchId),
      })),
    [glitches, echoes],
  )
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

  const desync = DESYNC_STYLES[desyncStateFor(magic)]
  const hackGlitch = hacking && placed.find((glitch) => glitch.glitchId === hacking.glitchId)
  const hackEcho = hackGlitch?.echoes.find((echo) => echo.echoId === hacking?.echoId)
  const hackTarget = hackGlitch && { glitch: hackGlitch, echo: hackEcho }

  return (
    <section
      aria-labelledby="map-title"
      className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="map-title" className="font-display text-[1.6rem] font-bold">
            Map of Achrona
          </h2>
          <p className="text-sm text-muted">
            Every glitch where it leaked, ringed by its echoes.
          </p>
        </div>
        <MagicMeter magic={magic} label={desync.label} />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Show statuses">
        {GLITCH_STATUSES.map((status) => {
          const { label, shape, color } = STATUS_STYLES[status]
          const count = placed.filter((glitch) => glitch.status === status).length
          const isShown = !hidden.includes(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={isShown}
              onClick={() => toggle(status)}
              className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-2 px-3.5 text-sm ${
                isShown ? 'border-edge bg-well text-fg' : 'border-line text-muted line-through opacity-60'
              } hover:border-edge-hover`}
            >
              <Shape kind={shape} color={color} />
              {label}
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
              onEchoSelect={
                isCommander ? (glitchId, echoId) => setHacking({ glitchId, echoId }) : undefined
              }
            />
          </div>
          <GlitchChips glitches={visible} selectedId={selected?.glitchId} onSelect={select} />
        </div>

        <aside aria-label="Selected glitch" className="flex flex-col gap-4 rounded-xl bg-row p-4">
          {selected ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">{selected.glitchId}</h3>
                  <GlitchStatusLabel status={selected.status} />
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <MapPin size={15} aria-hidden="true" />
                  {selected.district.name}
                </p>
                <p className="leading-snug break-words">{selected.description}</p>
                <p className="text-[.85rem] text-muted">
                  {selected.assignedCodename ?? 'Unassigned'} ·{' '}
                  <time dateTime={selected.timestamp}>{formatDateTime(selected.timestamp)}</time>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-soft">
                  {selected.echoes.length} {selected.echoes.length === 1 ? 'echo' : 'echoes'}
                </h4>
                <ul className="flex flex-col gap-2">
                  {selected.echoes.slice(0, RECENT_ECHOES).map((echo) => (
                    <li key={echo.echoId}>
                      <EchoRow
                        onHack={
                          isCommander
                            ? () => setHacking({ glitchId: selected.glitchId, echoId: echo.echoId })
                            : undefined
                        }
                      >
                        <span className="mt-1">
                          <Shape kind={STATUS_STYLES[echo.status].shape} color={STATUS_STYLES[echo.status].color} size={10} />
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 break-words">{echo.description}</span>
                          <span className="block text-[.8rem] text-muted">
                            {echo.reporter.codename} · {formatDateTime(echo.timestamp)}
                          </span>
                        </span>
                      </EchoRow>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/glitches/$glitchId"
                  params={{ glitchId: selected.glitchId }}
                  className="flex min-h-11 items-center gap-1.5 self-start text-sm text-muted hover:text-cyan"
                >
                  <span className="clickable">Open glitch</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              {isCommander && (
                <HackStatus
                  glitch={selected}
                  onOpen={() => setHacking({ glitchId: selected.glitchId })}
                />
              )}
            </>
          ) : (
            <p className="text-muted">No open glitches. Pick any marker to see its echoes.</p>
          )}
        </aside>
      </div>
      {hackTarget && (
        <HackTerminal
          key={`${hackTarget.glitch.glitchId}-${hackTarget.echo?.echoId}`}
          glitch={hackTarget.glitch}
          echo={hackTarget.echo}
          magic={magic}
          magicIfFixed={magicLevel(
            glitches.map((glitch) =>
              glitch.glitchId === hackTarget.glitch.glitchId ? 'FIXED' : glitch.status,
            ),
          )}
          onFixed={() => setFlashId(hackTarget.glitch.glitchId)}
          onClose={() => setHacking(undefined)}
        />
      )}
    </section>
  )
}

function MagicMeter({ magic, label }: { magic: number; label: string }) {
  const state = desyncStateFor(magic)
  return (
    <div className="flex min-w-48 flex-col gap-1.5" style={{ color: `var(--desync-${state})` }}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-display text-xl font-bold tabular-nums">{magic}%</span>
      </div>
      <div
        role="meter"
        aria-label="Magic in Achrona"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={magic}
        className="h-2 overflow-hidden rounded-full bg-well"
      >
        <div
          className="h-full rounded-full bg-current transition-[width] duration-700"
          style={{ width: `${magic}%`, boxShadow: `0 0 10px var(--desync-${state}-soft)` }}
        />
      </div>
    </div>
  )
}

/** For commanders, each echo opens the hacking terminal. */
function EchoRow({ onHack, children }: { onHack?: () => void; children: ReactNode }) {
  if (!onHack) return <div className="flex gap-2.5 text-sm">{children}</div>
  return (
    <button
      type="button"
      onClick={onHack}
      className="group flex w-full cursor-pointer gap-2.5 rounded-lg border-2 border-transparent p-1.5 text-left text-sm hover:border-edge hover:bg-well"
    >
      {children}
      <Terminal
        size={16}
        aria-label="Hack into this echo"
        className="mt-0.5 ml-auto shrink-0 text-muted group-hover:text-cyan"
      />
    </button>
  )
}

/** What is left to do with hacking on this glitch. */
function HackStatus({ glitch, onOpen }: { glitch: MapGlitch; onOpen: () => void }) {
  if (glitch.hackResult === 'FAILED') {
    return (
      <p className="flex items-start gap-2.5 rounded-xl border-2 border-(--status-leaked) bg-well px-4 py-3 text-sm">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-(--status-leaked)" aria-hidden="true" />
        <span>
          <b className="text-(--status-leaked)">Manual intervention required.</b>{' '}
          <span className="text-muted">The hack failed and cannot be tried again. Assign a defender.</span>
        </span>
      </p>
    )
  }
  if (glitch.hackResult === 'SUCCESS') {
    return (
      <p className="flex items-center gap-2 text-sm text-(--status-fixed)">
        <Sparkles size={16} aria-hidden="true" /> Fixed by a hack.
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
        Open hacking terminal
      </button>
      <p className="text-[.8rem] text-muted">
        Or click an echo, here or on the map. One hack attempt per glitch.
      </p>
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
  return (
    <div className="flex flex-col gap-2 md:hidden">
      <p className="text-[.8rem] text-muted">Swipe the map to explore, or pick a glitch:</p>
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
                isSelected ? 'border-cyan bg-well font-bold' : 'border-edge text-soft'
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
