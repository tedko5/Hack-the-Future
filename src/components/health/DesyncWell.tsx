import { useT } from '#/i18n/index.ts'
import { DESYNC_STYLES, desyncStateFor } from '#/lib/desync.ts'

type Style = (typeof DESYNC_STYLES)[keyof typeof DESYNC_STYLES]

// Well geometry (SVG user units)
const CX = 320
const CY = 150
const RX = 218
const RY = 68
/** Ring segments crack in this order: the rift eats in from the front right. */
const CRACK_ORDER = [4, 5, 3, 6, 2, 7, 1, 8, 0, 9, 11, 10]

const rad = (d: number) => (Math.PI / 180) * d
const onRim = (scale: number, deg: number) => [CX + RX * scale * Math.cos(rad(deg)), CY + RY * scale * Math.sin(rad(deg))]
const pt = ([x, y]: number[]) => `${x.toFixed(1)} ${y.toFixed(1)}`

/**
 * The Desync Well: three crystals on stone pedestals behind a rune-ringed pool.
 * Everything is driven by `magic` (0–100): crystal colour follows the desync state,
 * their glow fills up to the magic level, and ring segments crack as magic drops.
 * Colours below are the dark theme's; the `dw-*` classes let styles.css recolour the
 * well for the light theme (CSS wins over SVG presentation attributes).
 */
export function DesyncWell({ magic }: { magic: number }) {
  const t = useT()
  const state = desyncStateFor(magic)
  const st = DESYNC_STYLES[state]
  const level = magic / 100
  const cracked = new Set(CRACK_ORDER.slice(0, Math.round((1 - level) * 12)))
  const broken = state === 'critical'

  const segments = Array.from({ length: 12 }, (_, i) => {
    const t0 = i * 30 - 90 + 4
    const t1 = i * 30 - 90 + 26
    const tm = i * 30 - 90 + 15
    const d = `M${pt(onRim(1, t0))} A${RX} ${RY} 0 0 1 ${pt(onRim(1, t1))}`
    const crack = [onRim(1 + 9 / RX, tm), onRim(1 + 3 / RX, tm + 2.5), onRim(1 - 3 / RX, tm - 2.5), onRim(1 - 9 / RX, tm)]
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ')
    return { i, d, crack, ok: !cracked.has(i) }
  })

  return (
    <svg
      viewBox="60 -190 520 470"
      role="img"
      aria-label={t.magic.well(t.magic.states[state], cracked.size)}
      className={`desync-well desync-well--${state} block h-auto w-full max-w-[520px]`}
    >
      <defs>
        <filter id="well-blur-lg" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="well-blur-md" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="well-blur-sm" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient id="well-crystal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={st.color} />
          <stop offset="1" stopColor={st.deep} />
        </linearGradient>
      </defs>

      <ellipse className="dw-glow anim-pulse" cx={CX} cy={CY} rx="230" ry="70" fill={state === 'stable' ? '#2f64ff' : st.glow} filter="url(#well-blur-lg)" />

      <g className="dw-glow" filter="url(#well-blur-md)" opacity=".7">
        <Cluster x={150} flip={1} color={st.color} />
        <Cluster x={490} flip={-1} color={st.color} />
      </g>
      <Cluster x={150} flip={1} color={st.color} />
      <Cluster x={490} flip={-1} color={st.color} />

      <Crystal id="l" x={200} top={-90} w={58} base={24} level={Math.min(1, level + 0.08)} st={st} cracked={broken} lines={4} />
      <Pedestal x={200} w={82} top={20} />
      <Crystal id="r" x={440} top={-90} w={58} base={24} level={Math.max(0.05, level - 0.1)} st={st} cracked={broken} lines={4} />
      <Pedestal x={440} w={82} top={20} />
      <Crystal id="c" x={320} top={-175} w={76} base={6} level={level} st={st} cracked={broken} lines={7} />
      <Pedestal x={320} w={104} top={0} />

      {/* well body */}
      <path className="dw-well-side" d="M80,150 L80,178 A240,78 0 0 0 560,178 L560,150 Z" fill="#23253a" />
      <ellipse className="dw-well-rim" cx={CX} cy={CY} rx="240" ry="78" fill="#3a3d5c" />
      <ellipse className="dw-well-inner" cx={CX} cy={CY} rx="196" ry="60" fill="#1a1c30" />

      {/* rune ring */}
      <g className="dw-glow" filter="url(#well-blur-sm)" opacity=".8">
        {segments.filter((s) => s.ok).map((s) => (
          <path key={s.i} d={s.d} fill="none" stroke="#4df3ff" strokeWidth="12" />
        ))}
      </g>
      {segments.map((s) =>
        s.ok ? (
          <path key={s.i} className="dw-ring" d={s.d} fill="none" stroke="#4df3ff" strokeWidth="12" />
        ) : (
          <g key={s.i}>
            <path className="dw-ring-broken" d={s.d} fill="none" stroke="#2a1330" strokeWidth="12" />
            <polyline className="dw-ring-crack" points={s.crack} fill="none" stroke="#ff3df0" strokeWidth="2.5" />
          </g>
        ),
      )}

      {/* water; the violet stain grows as magic drains */}
      <ellipse className="dw-water-1" cx={CX} cy={CY} rx="182" ry="54" fill="#1d3fc7" />
      <ellipse className="dw-water-2" cx={CX} cy={CY} rx="142" ry="41" fill="#2f64ff" />
      <ellipse className="dw-water-3" cx={CX} cy={CY} rx="100" ry="29" fill="#4a8cff" />
      <ellipse className="dw-water-4" cx={CX} cy={CY} rx="58" ry="17" fill="#7fb2ff" />
      <ellipse cx="372" cy="158" rx={30 + (1 - level) * 110} ry={8 + (1 - level) * 26} className="dw-stain" fill="#8a5cff" opacity=".85" transform="rotate(-8 372 158)" />
      <g className="dw-sparkle" fill="#7ff6ff">
        <ellipse cx="270" cy="136" rx="16" ry="4" />
        <ellipse cx="340" cy="128" rx="9" ry="3" />
        <ellipse cx="246" cy="158" rx="10" ry="3" />
        <ellipse cx="300" cy="168" rx="14" ry="3.5" />
      </g>
      <ellipse cx={CX} cy={CY} rx="20" ry="6" fill="#fff" opacity=".8" />
    </svg>
  )
}

type CrystalProps = { id: string; x: number; top: number; w: number; base: number; level: number; st: Style; cracked: boolean; lines: number }

/** Tall prism with a pointed top; its glow fills from the bottom up to `level`. */
function Crystal({ id, x, top, w, base, level, st, cracked, lines }: CrystalProps) {
  const h = w / 2
  const sh = top + w * 0.85
  const pts = `${x},${top} ${x + h},${sh} ${x + h},${base} ${x - h},${base} ${x - h},${sh}`
  const fillY = base - (base - top) * level
  const clipId = `well-crystal-${id}`

  return (
    <g>
      <clipPath id={clipId}>
        <polygon points={pts} />
      </clipPath>
      <polygon className="dw-glow" points={pts} fill={st.glow} filter="url(#well-blur-md)" opacity={0.3 + level * 0.5} />
      <polygon className="dw-gem-body" points={pts} fill={st.body} />
      <rect x={x - h} y={fillY} width={w} height={base - fillY} className="dw-gem" fill="url(#well-crystal)" clipPath={`url(#${clipId})`} />
      <polygon points={`${x},${top} ${x - h},${sh} ${x - h},${base} ${x - h * 0.25},${base} ${x - h * 0.25},${sh}`} fill="#fff" opacity=".16" />
      <polygon points={`${x},${top} ${x + h},${sh} ${x + h},${base} ${x + h * 0.35},${base} ${x + h * 0.35},${sh}`} fill="#000" opacity=".22" />
      {Array.from({ length: lines }, (_, i) => {
        const y = sh + 18 + i * 12
        return (
          <rect key={i} x={x - h + 9} y={y} width={(i % 3 === 1 ? 0.32 : 0.5) * w} height="4" rx="1" className="dw-rune-line" fill="#eaf4ff" opacity={y > fillY ? 0.75 : 0.12} />
        )
      })}
      {cracked && (
        <polyline
          points={`${x - h},${sh + 34} ${x - 6},${sh + 50} ${x + 5},${sh + 40} ${x + h},${sh + 66}`}
          fill="none"
          className="dw-gem-crack"
          stroke="#15172a"
          strokeWidth="3.5"
          strokeLinejoin="bevel"
        />
      )}
    </g>
  )
}

/** Carved stone block; its lower half disappears behind the well rim. */
function Pedestal({ x, w, top }: { x: number; w: number; top: number }) {
  const bottom = 130
  const g = w / 2 - 16
  return (
    <g>
      <rect className="dw-stone" x={x - w / 2} y={top} width={w} height={bottom - top} rx="5" fill="#4e5274" />
      <rect x={x} y={top} width={w / 2} height={bottom - top} fill="#000" opacity=".2" />
      <rect className="dw-stone-top" x={x - w / 2} y={top} width={w} height="9" rx="3" fill="#6f7499" />
      <rect x={x - w / 2 + 9} y={top + 18} width={g} height="16" rx="2" className="dw-carve" fill="none" stroke="#2c2f4a" strokeWidth="3" />
      <path d={`M${x + 7} ${top + 18} h${g} v16 h-${g / 2} v-8`} className="dw-carve" fill="none" stroke="#2c2f4a" strokeWidth="3" />
    </g>
  )
}

function Cluster({ x, flip, color }: { x: number; flip: 1 | -1; color: string }) {
  return (
    <g className="dw-gem" transform={`translate(${x} 100) scale(${flip} 1)`} fill={color}>
      <polygon points="-2,0 -6,-26 0,-36 5,-24 4,0" />
      <polygon points="5,0 10,-16 17,-20 15,0" opacity=".75" />
      <polygon points="-3,0 -12,-14 -17,-10 -10,0" opacity=".6" />
    </g>
  )
}
