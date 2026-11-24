import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, MapPin, ShieldAlert, Sparkles, Terminal } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
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
import { locate } from '#/lib/map.ts'

export const Route = createFileRoute('/_app/map')({
  validateSearch: z.object({ glitch: z.string().optional().catch(undefined) }),
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
            {t.map.title}
          </h2>
          <p className="text-sm text-muted">{t.map.intro}</p>
        </div>
        <MagicMeter magic={magic} />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={t.map.showStatuses}>
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
              className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-2 px-3.5 text-sm ${
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
          <div className="tech-frame overflow-hidden rounded-xl border-2 border-edge bg-well">
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

        <aside aria-label={t.map.selected} className="flex flex-col gap-4 rounded-xl bg-row p-4">
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
                  {selected.echoes.length} {t.common.echoes(selected.echoes.length)}
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
                            {echo.reporter.codename} · {format.dateTime(echo.timestamp)}
                          </span>
                        </span>
                      </EchoRow>
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
                <HackStatus
                  glitch={selected}
                  onOpen={() => setHacking({ glitchId: selected.glitchId })}
                />
              )}
            </>
          ) : (
            <p className="text-muted">{t.map.noneOpen}</p>
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

function MagicMeter({ magic }: { magic: number }) {
  const t = useT()
  const state = desyncStateFor(magic)
  return (
    <div className="flex min-w-48 flex-col gap-1.5" style={{ color: `var(--desync-${state})` }}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{t.magic.states[state]}</span>
        <span className="font-display text-xl font-bold tabular-nums">{magic}%</span>
      </div>
      <div
        role="meter"
        aria-label={t.magic.title}
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
  const t = useT()
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
        aria-label={t.hack.intoThisEcho}
        className="mt-0.5 ml-auto shrink-0 text-muted group-hover:text-highlight"
      />
    </button>
  )
}

/** What is left to do with hacking on this glitch. */
function HackStatus({ glitch, onOpen }: { glitch: MapGlitch; onOpen: () => void }) {
  const t = useT()
  if (glitch.status === 'FIXED') {
    return glitch.hackResult === 'SUCCESS' ? (
      <p className="flex items-center gap-2 text-sm text-(--status-fixed)">
        <Sparkles size={16} aria-hidden="true" /> {t.hack.fixed}
      </p>
    ) : null
  }
  if (!canHack(glitch)) {
    return (
      <p className="flex items-start gap-2.5 rounded-xl border-2 border-(--status-leaked) bg-well px-4 py-3 text-sm">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-(--status-leaked)" aria-hidden="true" />
        <span>
          <b className="text-(--status-leaked)">{t.hack.manual}</b>{' '}
          <span className="text-muted">{glitch.hackResult === 'FAILED' ? t.hack.failed : t.hack.reopened}</span>
        </span>
      </p>
    )
  }
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
