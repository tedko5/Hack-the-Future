import type { CSSProperties } from 'react'
import { DesyncWell } from '#/components/health/DesyncWell.tsx'
import { ShapePath, type ShapeKind } from '#/components/ui/Shape.tsx'
import { DESYNC_STYLES, desyncStateFor, type DesyncState } from '#/lib/desync.ts'

const STATE_SHAPE: Record<DesyncState, ShapeKind> = {
  stable: 'circle',
  unstable: 'diamond',
  critical: 'square',
}

export function HealthPanel({ magic }: { magic: number }) {
  const state = desyncStateFor(magic)
  const st = DESYNC_STYLES[state]
  // Per-theme colours for this state, defined in styles.css.
  const vars = { '--st': `var(--desync-${state})`, '--st-soft': `var(--desync-${state}-soft)` } as CSSProperties

  return (
    <section
      aria-labelledby="health-title"
      className="grid grid-cols-1 gap-4.5 rounded-[18px] bg-panel p-3 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:p-4.5"
    >
      <div className="tech-frame flex items-center justify-center rounded-xl border-2 border-edge bg-well px-3 py-2">
        <DesyncWell magic={magic} />
      </div>

      <div
        style={vars}
        className="readout tech-frame relative isolate flex min-h-[25rem] flex-col items-center justify-center gap-4.5 text-center overflow-hidden rounded-xl border-2 border-edge p-5 md:p-6"
      >
        <ArcaneCircle />
        <GaugeDial magic={magic} />
        <Steam />
        <Motes />

        <h2 id="health-title" className="relative font-display text-[1.6rem] font-bold">
          Magic in Achrona
        </h2>
        {/* Centred as one visible group; the % sits tight on the digits' baseline. */}
        <p className="readout-pct relative font-display text-[clamp(4rem,10vw,5.6rem)] leading-[.85] font-bold tabular-nums [:root[data-theme=light]_&]:-mt-3">
          {magic}
          <span className="ml-0.5 text-[.45em] text-muted [text-shadow:none]">%</span>
        </p>
        {/* Icon and label centred as one group: the spinning sigil in dark, a small status mark
            in light (it fits inside the dial). */}
        <p className="readout-glow relative inline-flex items-center gap-3 font-display text-xl font-bold [:root[data-theme=light]_&]:gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="theme-light-only shrink-0">
            <ShapePath kind={STATE_SHAPE[state]} />
          </svg>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="theme-dark-only readout-icon shrink-0 overflow-visible">
            <g className="anim-spin-sigil" fill="none" stroke="currentColor">
              <circle cx="20" cy="20" r="18" strokeWidth="1.5" strokeDasharray="7 3 1 3" />
              <circle cx="20" cy="20" r="13.5" strokeWidth="1" opacity=".6" />
            </g>
            <g transform="translate(14 14)">
              <ShapePath kind={STATE_SHAPE[state]} />
            </g>
          </svg>
          {st.label}
        </p>      </div>
    </section>
  )
}


const TICKS = Array.from({ length: 36 }, (_, i) => {
  const a = (i * 10 * Math.PI) / 180
  const inner = i % 3 ? 144 : 132
  // Rounded: server and browser Math.cos can differ in the last digits, which breaks hydration.
  const r = (n: number) => n.toFixed(2)
  return { i, x1: r(160 + 150 * Math.cos(a)), y1: r(160 + 150 * Math.sin(a)), x2: r(160 + inner * Math.cos(a)), y2: r(160 + inner * Math.sin(a)) }
})

/** Dark theme: slow-turning arcane circle behind the readout. */
function ArcaneCircle() {
  return (
    <svg
      viewBox="0 0 320 320"
      aria-hidden="true"
      className="theme-dark-only pointer-events-none absolute top-1/2 left-1/2 -z-10 size-80 -translate-x-1/2 -translate-y-1/2 text-(--st) opacity-20"
    >
      <g className="anim-spin-slow" fill="none" stroke="currentColor">
        <circle cx="160" cy="160" r="150" strokeWidth="2" />
        <circle cx="160" cy="160" r="138" strokeWidth="1" strokeDasharray="2 6" />
        <g strokeWidth="2">
          {TICKS.map((t) => (
            <line key={t.i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>
      </g>
      <g className="anim-spin-rev" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="160" cy="160" r="104" />
        <polygon points="160,58 248,211 72,211" />
        <polygon points="160,262 72,109 248,109" />
        <circle cx="160" cy="160" r="40" />
      </g>
    </svg>
  )
}

/** Dark theme: specks of magic drifting up. Positions are deterministic so SSR and client agree. */
function Motes() {
  return (
    <div aria-hidden="true" className="theme-dark-only pointer-events-none absolute inset-0 -z-10">
      {Array.from({ length: 14 }, (_, i) => {
        const size = 2 + (i % 3) * 1.5
        const style = {
          left: `${(i * 37) % 100}%`,
          width: size,
          height: size,
          '--d': `${7 + (i % 5) * 1.6}s`,
          '--delay': `-${(i * 1.3).toFixed(1)}s`,
          '--dx': `${(i % 2 ? 1 : -1) * (8 + i * 2)}px`,
        } as CSSProperties
        return <i key={i} className="mote" style={style} />
      })}
    </div>
  )
}

// Light theme gauge: a 270° scale open at the bottom, 0% at the lower left, 100% at the lower right.
const DIAL = { c: 160, r: 128, start: 135, sweep: 270 }
const r2 = (n: number) => n.toFixed(2)
const dialPoint = (radius: number, pct: number) => {
  const a = ((DIAL.start + (DIAL.sweep * pct) / 100) * Math.PI) / 180
  // Rounded: server and browser Math.cos can differ in the last digits, which breaks hydration.
  return [r2(DIAL.c + radius * Math.cos(a)), r2(DIAL.c + radius * Math.sin(a))]
}
const dialArc = (radius: number, pct: number) => {
  const [x0, y0] = dialPoint(radius, 0)
  const [x1, y1] = dialPoint(radius, pct)
  const large = (DIAL.sweep * pct) / 100 > 180 ? 1 : 0
  return `M${x0} ${y0} A${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`
}
const DIAL_TICKS = Array.from({ length: 51 }, (_, i) => {
  const pct = i * 2
  const major = pct % 10 === 0
  const [x1, y1] = dialPoint(DIAL.r + 10, pct)
  const [x2, y2] = dialPoint(DIAL.r + (major ? 24 : 17), pct)
  return { pct, major, x1, y1, x2, y2 }
})

/** Light theme: a brass instrument gauge behind the readout, filled up to the magic level. */
function GaugeDial({ magic }: { magic: number }) {
  const value = Math.max(0, Math.min(100, magic))
  const [nx, ny] = dialPoint(DIAL.r, value)
  const [lx0, ly0] = dialPoint(DIAL.r + 38, 0)
  const [lx1, ly1] = dialPoint(DIAL.r + 38, 100)
  return (
    <svg
      viewBox="0 0 320 320"
      aria-hidden="true"
      className="theme-light-only pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[24rem] -translate-x-1/2 -translate-y-1/2"
    >
      <g stroke="var(--edge)">
        {DIAL_TICKS.map((t) => (
          <line key={t.pct} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 2 : 1} opacity={t.major ? 0.9 : 0.5} />
        ))}
      </g>
      <path d={dialArc(DIAL.r, 100)} fill="none" stroke="var(--line)" strokeWidth="8" strokeLinecap="round" />
      {/* pathLength=100 lets CSS sweep the fill from 0 to the value on load (gauge-sweep). */}
      {value > 0 && (
        <path className="gauge-sweep" d={dialArc(DIAL.r, value)} pathLength={100} fill="none" stroke="var(--st)" strokeWidth="8" strokeLinecap="round" />
      )}
      <circle className="gauge-cap" cx={nx} cy={ny} r="9" fill="var(--well)" stroke="var(--st)" strokeWidth="3" />
      <g fill="var(--muted)" fontSize="13" fontFamily="Figtree, sans-serif" textAnchor="middle">
        <text x={lx0} y={ly0}>0</text>
        <text x={lx1} y={ly1}>100</text>
      </g>
    </svg>
  )
}

/** Light theme: puffs of steam drifting up behind the readout. Deterministic for SSR. */
function Steam() {
  return (
    <div aria-hidden="true" className="theme-light-only pointer-events-none absolute inset-0 -z-10">
      {Array.from({ length: 9 }, (_, i) => {
        const size = 18 + (i % 3) * 10
        const style = {
          left: `${8 + ((i * 41) % 84)}%`,
          width: size,
          height: size,
          '--d': `${8 + (i % 4) * 2}s`,
          '--delay': `-${(i * 1.7).toFixed(1)}s`,
          '--dx': `${(i % 2 ? 1 : -1) * (10 + i * 3)}px`,
        } as CSSProperties
        return <i key={i} className="steam-puff" style={style} />
      })}
    </div>
  )
}
