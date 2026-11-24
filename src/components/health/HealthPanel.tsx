import type { CSSProperties, ReactNode } from 'react'
import { DesyncWell } from '#/components/health/DesyncWell.tsx'
import { ShapePath, type ShapeKind } from '#/components/ui/Shape.tsx'
import { DESYNC_STYLES, desyncStateFor, type DesyncState } from '#/lib/desync.ts'

const STATE_SHAPE: Record<DesyncState, ShapeKind> = {
  stable: 'circle',
  unstable: 'diamond',
  critical: 'square',
}

type Props = {
  magic: number
  openGlitches: number
  echoesToday: number
}

export function HealthPanel({ magic, openGlitches, echoesToday }: Props) {
  const state = desyncStateFor(magic)
  const st = DESYNC_STYLES[state]
  const vars = { '--st': st.color, '--st-soft': `${st.glow}66` } as CSSProperties

  return (
    <section
      aria-labelledby="health-title"
      className="grid grid-cols-1 gap-4.5 rounded-[18px] bg-panel p-3 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:p-4.5"
    >
      <div className="flex items-center justify-center rounded-xl border-2 border-edge bg-well px-3 py-2">
        <DesyncWell magic={magic} />
      </div>

      <div
        style={vars}
        className="readout relative isolate flex flex-col justify-center gap-4.5 overflow-hidden rounded-xl border-2 border-edge p-5 md:p-6"
      >
        <ArcaneCircle />
        <Motes />

        <h2 id="health-title" className="relative font-display text-[1.6rem] font-bold">
          Magic in Achrona
        </h2>
        <p className="readout-pct relative font-display text-[clamp(4rem,10vw,5.6rem)] leading-[.85] font-bold">
          {magic}
          <span className="ml-1 text-[.45em] text-muted [text-shadow:none]">%</span>
        </p>
        <p className="readout-glow relative inline-flex items-center gap-3 self-start font-display text-xl font-bold">
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="readout-icon shrink-0 overflow-visible">
            <g className="anim-spin-sigil" fill="none" stroke="currentColor">
              <circle cx="20" cy="20" r="18" strokeWidth="1.5" strokeDasharray="7 3 1 3" />
              <circle cx="20" cy="20" r="13.5" strokeWidth="1" opacity=".6" />
            </g>
            <g transform="translate(14 14)">
              <ShapePath kind={STATE_SHAPE[state]} color={st.color} />
            </g>
          </svg>
          {st.label}
        </p>

        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
          <Fact value={openGlitches} label="Open glitches" icon={<GlitchGlyph />} />
          <Fact value={echoesToday} label="Echoes today" icon={<EchoGlyph />} />
        </div>
      </div>
    </section>
  )
}

function Fact({ value, label, icon }: { value: number; label: string; icon: ReactNode }) {
  return (
    <div className="stone grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 px-4 py-3.5">
      <span className="readout-icon row-span-2">{icon}</span>
      <b className="font-display text-[2rem] leading-none [text-shadow:0_0_14px_var(--st-soft)]">{value}</b>
      <span className="text-sm whitespace-nowrap text-[#b9c0e6]">{label}</span>
    </div>
  )
}

const GlitchGlyph = () => (
  <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">
    <path d="M13 1 L21 9 L17 15 L23 21 L13 29 L5 21 L10 15 L3 9 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="bevel" />
    <path d="M13 7 L11 14 L15 17 L12 23" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

const EchoGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
    <circle cx="15" cy="15" r="3" fill="currentColor" />
    <path
      d="M9 9 A8.5 8.5 0 0 0 9 21 M21 9 A8.5 8.5 0 0 1 21 21 M5 5 A14 14 0 0 0 5 25 M25 5 A14 14 0 0 1 25 25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const TICKS = Array.from({ length: 36 }, (_, i) => {
  const a = (i * 10 * Math.PI) / 180
  const inner = i % 3 ? 144 : 132
  // Rounded: server and browser Math.cos can differ in the last digits, which breaks hydration.
  const r = (n: number) => n.toFixed(2)
  return { i, x1: r(160 + 150 * Math.cos(a)), y1: r(160 + 150 * Math.sin(a)), x2: r(160 + inner * Math.cos(a)), y2: r(160 + inner * Math.sin(a)) }
})

/** Slow-turning arcane circle in the corner of the readout. */
function ArcaneCircle() {
  return (
    <svg
      viewBox="0 0 320 320"
      aria-hidden="true"
      className="pointer-events-none absolute -top-28 -right-28 -z-10 size-80 text-(--st) opacity-20"
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

/** Specks of magic drifting up. Positions are deterministic so SSR and client agree. */
function Motes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
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
