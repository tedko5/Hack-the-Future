import { Fragment, useEffect, useRef, type KeyboardEvent } from 'react'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { ShapePath } from '#/components/ui/Shape.tsx'
import { useT } from '#/i18n/index.ts'
import type { Echo } from '#/lib/schemas/echo.ts'
import type { Glitch } from '#/lib/schemas/glitch.ts'
import { MAP_HEIGHT, MAP_WIDTH, type GlitchLocation } from '#/lib/achrona/map.ts'
import { MapArt } from './MapArt.tsx'

/** Most echoes drawn around one glitch; the rest are counted in its tooltip. */
const MAX_ECHO_DOTS = 12

export type MapGlitch = Glitch & GlitchLocation & { echoes: Echo[] }

type Props = {
  glitches: MapGlitch[]
  selectedId: string | undefined
  onSelect: (glitchId: string) => void
  /** Plays the fix animation on this glitch. */
  flashId?: string
}

export function AchronaMap({ glitches, selectedId, onSelect, flashId }: Props) {
  const t = useT()
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
      <div className="relative min-w-[640px] md:min-w-0">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="group"
          aria-label={t.map.title}
          className="achrona-map block h-auto w-full select-none"
        >
          <MapArt />

          {ordered.map((glitch) => (
            <GlitchMarker
              key={glitch.glitchId}
              glitch={glitch}
              isSelected={glitch.glitchId === selectedId}
              onSelect={() => onSelect(glitch.glitchId)}
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
}

function GlitchMarker({ glitch, isSelected, onSelect }: MarkerProps) {
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
        return (
          <circle
            key={echo.echoId}
            cx={Math.cos(angle) * 24}
            cy={Math.sin(angle) * 24}
            r="5"
            style={{ fill: STATUS_STYLES[echo.status].color }}
            className="stroke-well"
            strokeWidth="1"
          />
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
