import { Anchor, Clock, Library, Store, Tornado, Trees, type LucideIcon } from 'lucide-react'
import { useT } from '#/i18n/index.ts'
import { DISTRICTS, MAP_HEIGHT, MAP_WIDTH, type District, type DistrictId } from '#/lib/achrona/map.ts'

/**
 * The land, sea, ley lines and districts under the glitch markers. Dark theme: an arcane star
 * chart. Light theme: a brass-and-parchment sea chart. Colours are the --map-* variables in
 * styles.css; parts only one theme has use theme-dark-only / theme-light-only.
 * Nothing in here moves: animating inside the SVG would repaint the whole map every frame.
 */

const ICONS: Record<Exclude<DistrictId, 'crystal-spire'>, LucideIcon> = {
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
/** Roughly the middle of the island: coast lines are scaled around it. */
const ISLE = { x: 512, y: 334 }

/** Coast lines rippling out to sea, fainter the further out. */
const RIPPLES = [
  { scale: 1.035, opacity: 0.55 },
  { scale: 1.075, opacity: 0.32 },
  { scale: 1.12, opacity: 0.16 },
]

const scaleAround = (scale: number) =>
  `translate(${ISLE.x} ${ISLE.y}) scale(${scale}) translate(${-ISLE.x} ${-ISLE.y})`

// Fixed pseudo-random stars, rounded so the server and the browser draw the same ones.
const STARS = (() => {
  let seed = 7
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: 90 }, (_, i) => ({
    i,
    x: (next() * MAP_WIDTH).toFixed(1),
    y: (next() * MAP_HEIGHT).toFixed(1),
    r: (0.6 + next() * 1.3).toFixed(2),
    opacity: (0.2 + next() * 0.55).toFixed(2),
  }))
})()
/** The brightest stars get a four-pointed glint. */
const GLINTS = [
  [70, 120], [960, 250], [250, 612], [640, 24], [980, 600], [36, 420],
] as const

/** Little waves on the light theme's sea. */
const WAVES = [
  [52, 150], [74, 520], [300, 30], [820, 40], [958, 420], [700, 618], [180, 608], [40, 300], [968, 160],
] as const

const leyLine = (district: District, heart: District) =>
  `M${district.x},${district.y} Q${(district.x + heart.x) / 2},${(district.y + heart.y) / 2 - 40} ${heart.x},${heart.y}`

export function MapArt() {
  const t = useT()
  const [heart, ...districts] = DISTRICTS

  return (
    <g aria-hidden="true">
      <defs>
        <radialGradient id="ma-land" cx="51%" cy="50%" r="55%">
          <stop offset="0%" style={{ stopColor: 'var(--map-land-core)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--map-land)' }} />
        </radialGradient>
        {/* The same rift-to-copper edge as the sign-in card; flat brass in light. */}
        <linearGradient id="ma-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--card-border-from)' }} />
          <stop offset="50%" style={{ stopColor: 'var(--edge)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--card-border-to)' }} />
        </linearGradient>
        <linearGradient id="ma-gem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--map-gem-top)' }} />
          <stop offset="1" style={{ stopColor: 'var(--map-gem-bottom)' }} />
        </linearGradient>
        <filter id="ma-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="ma-blur-lg" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <pattern id="ma-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="var(--line)" strokeWidth="1" opacity=".45" />
        </pattern>
      </defs>

      {/* Sea */}
      <g className="theme-dark-only">
        {STARS.map((star) => (
          <circle key={star.i} cx={star.x} cy={star.y} r={star.r} fill="var(--fg)" opacity={star.opacity} />
        ))}
        {GLINTS.map(([x, y]) => (
          <path
            key={`${x}-${y}`}
            d={`M${x},${y - 7} L${x + 1.4},${y - 1.4} L${x + 7},${y} L${x + 1.4},${y + 1.4} L${x},${y + 7} L${x - 1.4},${y + 1.4} L${x - 7},${y} L${x - 1.4},${y - 1.4} Z`}
            fill="var(--fg)"
            opacity=".7"
          />
        ))}
      </g>
      <g className="theme-light-only">
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#ma-grid)" />
        {WAVES.map(([x, y]) => (
          <path
            key={`${x}-${y}`}
            d={`M${x - 14},${y} q7,-6 14,0 t14,0`}
            fill="none"
            stroke="var(--map-ripple)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity=".55"
          />
        ))}
      </g>

      {/* Coast lines out to sea: a violet aura in dark, engraved lines in light */}
      {RIPPLES.map(({ scale, opacity }) => (
        <path
          key={scale}
          d={COAST}
          transform={scaleAround(scale)}
          fill="none"
          stroke="var(--map-ripple)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          opacity={opacity}
        />
      ))}

      {/* Land */}
      <path d={COAST} fill="url(#ma-land)" stroke="url(#ma-rim)" strokeWidth="3" />
      <path
        d={COAST}
        transform={scaleAround(0.965)}
        fill="none"
        stroke="var(--map-rune)"
        strokeWidth="1.5"
        strokeDasharray="2 9"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity=".7"
      />

      {/* River: a soft glow under a bright core */}
      <path d={RIVER} fill="none" stroke="var(--map-river)" strokeWidth="12" strokeLinecap="round" opacity=".16" />
      <path d={RIVER} fill="none" stroke="var(--map-river)" strokeWidth="3" strokeLinecap="round" opacity=".7" />

      {/* Ley lines to the Crystal Spire: glowing in dark, dotted brass in light */}
      <g className="theme-dark-only" filter="url(#ma-blur)" opacity=".55">
        {districts.map((district) => (
          <path key={district.id} d={leyLine(district, heart)} fill="none" stroke="var(--violet)" strokeWidth="5" />
        ))}
      </g>
      {districts.map((district) => (
        <path
          key={district.id}
          d={leyLine(district, heart)}
          fill="none"
          stroke="var(--map-ley)"
          strokeWidth="2.5"
          strokeDasharray="0.1 9"
          strokeLinecap="round"
        />
      ))}

      <CrystalSpire district={heart} label={t.map.districts[heart.id]} />
      {districts.map((district) => (
        <Sigil key={district.id} district={district} label={t.map.districts[district.id]} />
      ))}

      <Cartouche />
      <Compass x={918} y={88} />
    </g>
  )
}

/** A district: its icon in a rune-ringed seal. */
function Sigil({ district, label }: { district: District; label: string }) {
  const Icon = ICONS[district.id as keyof typeof ICONS]
  const { x, y } = district
  return (
    <g>
      <circle cx={x} cy={y} r="29" fill="none" stroke="var(--map-rune)" strokeWidth="1.25" strokeDasharray="3 5" />
      {[0, 90, 180, 270].map((angle) => (
        <line
          key={angle}
          x1={x}
          y1={y - 27}
          x2={x}
          y2={y - 34}
          transform={`rotate(${angle} ${x} ${y})`}
          stroke="var(--map-rune)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <circle cx={x} cy={y} r="21" fill="var(--well)" stroke="var(--edge)" strokeWidth="2" />
      <g style={{ color: 'var(--soft)' }}>
        <Icon x={x - 10} y={y - 10} width={20} height={20} strokeWidth={1.75} />
      </g>
      <Label x={x} y={y + 50}>
        {label}
      </Label>
    </g>
  )
}

const SPIRE_TICKS = Array.from({ length: 24 }, (_, i) => i * 15)

/** The heart of Achrona: the emblem's three crystals in a ring of rune ticks. */
function CrystalSpire({ district, label }: { district: District; label: string }) {
  const { x, y } = district
  return (
    <g>
      <ellipse cx={x} cy={y} rx="70" ry="60" fill="var(--violet)" opacity=".45" filter="url(#ma-blur-lg)" className="theme-dark-only" />
      <circle cx={x} cy={y} r="46" fill="var(--well)" opacity=".75" stroke="var(--edge)" strokeWidth="2" />
      <circle cx={x} cy={y} r="39" fill="none" stroke="var(--map-rune)" strokeWidth="1" strokeDasharray="2 4" />
      {SPIRE_TICKS.map((angle) => (
        <line
          key={angle}
          x1={x}
          y1={y - 46}
          x2={x}
          y2={y - (angle % 45 === 0 ? 56 : 51)}
          transform={`rotate(${angle} ${x} ${y})`}
          stroke="var(--map-rune)"
          strokeWidth={angle % 45 === 0 ? 2 : 1.25}
          strokeLinecap="round"
        />
      ))}
      {/* The emblem (120×84) at half size, centred on the spire. */}
      <g transform={`translate(${x - 30} ${y - 24}) scale(.5)`}>
        <polygon points="30,22 40,32 40,70 20,70 20,32" fill="url(#ma-gem)" />
        <polygon points="30,22 20,32 20,70 27,70 27,32" fill="#fff" opacity=".2" />
        <polygon points="30,22 40,32 40,70 33,70 33,32" fill="#000" opacity=".22" />
        <polygon points="90,22 100,32 100,70 80,70 80,32" fill="url(#ma-gem)" />
        <polygon points="90,22 80,32 80,70 87,70 87,32" fill="#fff" opacity=".2" />
        <polygon points="90,22 100,32 100,70 93,70 93,32" fill="#000" opacity=".22" />
        <polygon points="60,2 73,15 73,70 47,70 47,15" fill="url(#ma-gem)" />
        <polygon points="60,2 47,15 47,70 56,70 56,15" fill="#fff" opacity=".22" />
        <polygon points="60,2 73,15 73,70 64,70 64,15" fill="#000" opacity=".22" />
        <rect x="8" y="70" width="104" height="7" rx="3.5" fill="var(--map-river)" />
      </g>
      <Label x={x} y={y + 76}>
        {label}
      </Label>
    </g>
  )
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill="var(--fg)"
      fontSize="17"
      fontWeight="700"
      letterSpacing=".5"
      paintOrder="stroke"
      stroke="var(--map-land)"
      strokeWidth="5"
      strokeLinejoin="round"
      className="font-display"
    >
      {children}
    </text>
  )
}

/** The realm's name in the top left, as on an old chart. */
function Cartouche() {
  return (
    <g transform="translate(150 44)">
      <line x1="-112" y1="0" x2="-74" y2="0" stroke="var(--map-rune)" strokeWidth="1.5" />
      <line x1="74" y1="0" x2="112" y2="0" stroke="var(--map-rune)" strokeWidth="1.5" />
      <polygon points="-120,0 -114,-4 -108,0 -114,4" fill="var(--highlight)" />
      <polygon points="120,0 114,-4 108,0 114,4" fill="var(--highlight)" />
      <text
        y="8"
        textAnchor="middle"
        fill="var(--fg)"
        fontSize="24"
        fontWeight="700"
        letterSpacing="5"
        className="font-display"
      >
        ACHRONA
      </text>
    </g>
  )
}

const COMPASS_TICKS = Array.from({ length: 32 }, (_, i) => i * 11.25)

/** A rune star in dark, a brass compass rose in light: the same drawing in each theme's colours. */
function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="40" fill="var(--well)" opacity=".6" stroke="var(--map-rune)" strokeWidth="1.5" />
      <circle r="33" fill="none" stroke="var(--map-rune)" strokeWidth="1" strokeDasharray="2 3" />
      {COMPASS_TICKS.map((angle) => (
        <line
          key={angle}
          y1="-40"
          y2={angle % 90 === 0 ? -31 : -36}
          transform={`rotate(${angle})`}
          stroke="var(--map-rune)"
          strokeWidth="1"
        />
      ))}
      {/* Diagonal points, then the four main ones; north in gold. */}
      <g transform="rotate(45)" fill="var(--map-rune)" opacity=".7">
        {[0, 90, 180, 270].map((angle) => (
          <polygon key={angle} points="0,-22 4,-4 0,0 -4,-4" transform={`rotate(${angle})`} />
        ))}
      </g>
      {[90, 180, 270].map((angle) => (
        <polygon key={angle} points="0,-30 6,-6 0,0 -6,-6" transform={`rotate(${angle})`} fill="var(--soft)" />
      ))}
      <polygon points="0,-30 6,-6 0,0 -6,-6" fill="var(--highlight)" />
      <circle r="3.5" fill="var(--well)" stroke="var(--map-rune)" strokeWidth="1.5" />
      <text y="-46" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--soft)" className="font-display">
        N
      </text>
    </g>
  )
}
