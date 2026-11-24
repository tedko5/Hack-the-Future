import { Anchor, Clock, Gem, Library, Store, Tornado, Trees, type LucideIcon } from 'lucide-react'
import { Fragment, useEffect, useRef, type KeyboardEvent } from 'react'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { ShapePath } from '#/components/ui/Shape.tsx'
import { useT } from '#/i18n/index.ts'
import type { Echo } from '#/lib/echo.ts'
import type { Glitch } from '#/lib/glitch.ts'
import { DISTRICTS, MAP_HEIGHT, MAP_WIDTH, type DistrictId, type GlitchLocation } from '#/lib/map.ts'

const ICONS: Record<DistrictId, LucideIcon> = {
  'crystal-spire': Gem,
  'clock-tower': Clock,
  'archive-vaults': Library,
  'ley-market': Store,
  'rift-gate': Tornado,
  'whispering-woods': Trees,
  'moonlit-harbor': Anchor,
}

const COAST =
  'M118,300 C104,180 228,86 380,78 C500,72 560,46 690,70 C820,96 930,196 905,330 C888,430 948,515 830,568 C710,620 568,580 452,602 C318,626 176,584 140,484 C112,410 130,360 118,300 Z'
const RIVER = 'M612,74 C590,150 560,220 540,280 C520,340 470,380 470,450 C470,520 500,560 486,606'

/** Most echoes drawn around one glitch; the rest are counted in its tooltip. */
const MAX_ECHO_DOTS = 12

export type MapGlitch = Glitch & GlitchLocation & { echoes: Echo[] }

type Props = {
  glitches: MapGlitch[]
  selectedId: string | undefined
  onSelect: (glitchId: string) => void
  /** Plays the fix animation on this glitch. */
  flashId?: string
  /** Makes the echo dots clickable. */
  onEchoSelect?: (glitchId: string, echoId: number) => void
}

export function AchronaMap({ glitches, selectedId, onSelect, flashId, onEchoSelect }: Props) {
  const t = useT()
  const heart = DISTRICTS[0]
  const scroller = useRef<HTMLDivElement>(null)
  const selected = glitches.find((glitch) => glitch.glitchId === selectedId)

  // On a phone the map is wider than the screen: bring the selected glitch into view.
  useEffect(() => {
    const element = scroller.current
    if (!element || !selected || element.scrollWidth <= element.clientWidth) return
    const left = (selected.x / MAP_WIDTH) * element.scrollWidth - element.clientWidth / 2
    element.scrollTo({ left, behavior: 'smooth' })
  }, [selected?.glitchId, selected?.x])
  // Selected last, so it is drawn on top.
  const ordered = [...glitches].sort(
    (a, b) => Number(a.glitchId === selectedId) - Number(b.glitchId === selectedId),
  )

  return (
    // Below md the map keeps a readable size and scrolls sideways instead of shrinking.
    <div ref={scroller} className="no-scrollbar overflow-x-auto overscroll-x-contain md:overflow-visible">
      <div className="relative min-w-[700px] md:min-w-0">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="group"
          aria-label={t.map.title}
          className="achrona-map block h-auto w-full select-none"
        >
          <defs>
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" className="stroke-line" strokeWidth="1" opacity=".35" />
            </pattern>
            <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: 'var(--violet)', stopOpacity: 0.22 }} />
              <stop offset="100%" style={{ stopColor: 'var(--violet)', stopOpacity: 0 }} />
            </radialGradient>
          </defs>

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-grid)" />
          <Compass x={930} y={80} />

          {/* Land */}
          <path d={COAST} className="map-coast-halo fill-none stroke-edge" strokeWidth="14" opacity=".18" />
          <path d={COAST} className="fill-row stroke-edge" strokeWidth="2.5" />
          <ellipse cx={heart.x} cy={heart.y} rx="300" ry="220" fill="url(#map-glow)" className="theme-dark-only" />
          <path d={RIVER} fill="none" className="stroke-(--cyan)" strokeWidth="5" strokeLinecap="round" opacity=".35" />

          {/* Ley lines from every district to the Crystal Spire */}
          {DISTRICTS.slice(1).map((district) => (
            <path
              key={district.id}
              d={`M${district.x},${district.y} Q${(district.x + heart.x) / 2},${(district.y + heart.y) / 2 - 40} ${heart.x},${heart.y}`}
              fill="none"
              className="stroke-ley"
              strokeWidth="2"
              strokeDasharray="6 8"
            />
          ))}

          {DISTRICTS.map((district) => {
            const Icon = ICONS[district.id]
            return (
              <g key={district.id} className="text-muted" aria-hidden="true">
                <circle cx={district.x} cy={district.y} r="20" className="fill-well stroke-edge" strokeWidth="2" />
                <Icon x={district.x - 10} y={district.y - 10} width={20} height={20} strokeWidth={1.75} />
                <text
                  x={district.x}
                  y={district.y + 40}
                  textAnchor="middle"
                  className="fill-soft font-display"
                  fontSize="17"
                  fontWeight="700"
                  paintOrder="stroke"
                  style={{ stroke: 'var(--row)' }}
                  strokeWidth="4"
                >
                  {t.map.districts[district.id]}
                </text>
              </g>
            )
          })}

          {ordered.map((glitch) => (
            <GlitchMarker
              key={glitch.glitchId}
              glitch={glitch}
              isSelected={glitch.glitchId === selectedId}
              onSelect={() => onSelect(glitch.glitchId)}
              onEchoSelect={onEchoSelect && ((echoId) => onEchoSelect(glitch.glitchId, echoId))}
            />
          ))}
        </svg>
        <Rings glitches={glitches} selectedId={selectedId} flashId={flashId} />
      </div>
    </div>
  )
}

/**
 * The moving rings, as HTML on top of the map rather than inside the SVG. Animating
 * anything in the SVG repaints the whole map every frame; these the GPU moves alone.
 */
function Rings({ glitches, selectedId, flashId }: Pick<Props, 'glitches' | 'selectedId' | 'flashId'>) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {glitches.map((glitch) => {
        const style = {
          left: `${(glitch.x / MAP_WIDTH) * 100}%`,
          top: `${(glitch.y / MAP_HEIGHT) * 100}%`,
          color: STATUS_STYLES[glitch.status].color,
        }
        return (
          <Fragment key={glitch.glitchId}>
            {glitch.status !== 'FIXED' && <span className="map-ring map-pulse" style={style} />}
            {glitch.glitchId === selectedId && <span className="map-ring map-selected" style={style} />}
            {glitch.glitchId === flashId && <span className="map-ring map-flash" style={style} />}
          </Fragment>
        )
      })}
    </div>
  )
}

type MarkerProps = {
  glitch: MapGlitch
  isSelected: boolean
  onSelect: () => void
  onEchoSelect?: (echoId: number) => void
}

function GlitchMarker({ glitch, isSelected, onSelect, onEchoSelect }: MarkerProps) {
  const t = useT()
  const { shape, color } = STATUS_STYLES[glitch.status]
  const label = t.status[glitch.status]
  // Oldest first, so the ring fills clockwise as echoes come in.
  const dots = [...glitch.echoes].reverse().slice(0, MAX_ECHO_DOTS)
  const spread = Math.max(dots.length, 6)
  const size = isSelected ? 30 : 24
  const echoCount = `${glitch.echoes.length} ${t.common.echoes(glitch.echoes.length)}`

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${glitch.glitchId}, ${label}, ${t.map.districts[glitch.district.id]}, ${echoCount}`}
      className="map-marker cursor-pointer"
      style={{ color }}
      transform={`translate(${glitch.x} ${glitch.y})`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <title>{`${glitch.glitchId} · ${label}\n${glitch.description}\n${echoCount}`}</title>
      {/* Bigger hit area than the mark itself */}
      <circle r="34" fill="transparent" />
      {dots.map((echo, index) => {
        const angle = (index / spread) * Math.PI * 2 - Math.PI / 2
        const cx = Math.cos(angle) * 24
        const cy = Math.sin(angle) * 24
        const dot = (
          <circle
            cx={cx}
            cy={cy}
            r={onEchoSelect ? 6 : 4}
            style={{ fill: STATUS_STYLES[echo.status].color }}
            className="stroke-well"
            strokeWidth="1"
          />
        )
        if (!onEchoSelect) return <g key={echo.echoId}>{dot}</g>
        return (
          <g
            key={echo.echoId}
            className="map-echo"
            onClick={(event) => {
              // Also selects the glitch, then opens the terminal on top.
              event.stopPropagation()
              onSelect()
              onEchoSelect(echo.echoId)
            }}
          >
            <title>{t.hack.intoEcho(echo.echoId)}</title>
            {/* A dot is small: this makes it easy to hit. */}
            <circle cx={cx} cy={cy} r="15" fill="transparent" />
            {dot}
          </g>
        )
      })}
      <svg
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        viewBox="-1 -1 14 14"
        className="map-mark overflow-visible"
      >
        <g className="stroke-well" strokeWidth="1.5">
          <ShapePath kind={shape} />
        </g>
      </svg>
    </g>
  )
}

function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="text-muted" aria-hidden="true" opacity=".7">
      <circle r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle r="22" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
      <polygon points="0,-28 6,0 0,28 -6,0" fill="currentColor" opacity=".5" />
      <polygon points="0,-28 6,0 -6,0" className="fill-copper" />
      <text y="-36" textAnchor="middle" fontSize="14" className="fill-muted font-display" fontWeight="700">
        N
      </text>
    </g>
  )
}
