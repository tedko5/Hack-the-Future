import type { CSSProperties } from 'react'
import { cogPath, cornerCogs, pitchRadius } from '#/lib/cog.ts'

/**
 * Fixed backdrop: grain plus corner art in the top-left and bottom-right corners.
 * Dark theme: purple rift branches. Light theme: brass cogs (see styles.css).
 */
export function RiftBackground() {
  return (
    <>
      <svg className="grain" aria-hidden="true">
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.35" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>

      <svg className="rift rift--tl theme-dark-only" viewBox="0 0 600 600" aria-hidden="true">
        <defs>
          <linearGradient id="rift-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#6a1bc4" />
            <stop offset=".55" stopColor="#b237ff" />
            <stop offset="1" stopColor="#e06bff" />
          </linearGradient>
          <filter id="rift-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <g id="rift-branches">
            <path d="M-30 470 L60 430 L92 360 L170 332 L198 252 L280 212 L300 132 L380 92 L420 -30" strokeWidth="40" />
            <path d="M170 332 L246 378 L330 368 L372 424 L440 430" strokeWidth="22" />
            <path d="M280 212 L342 246 L424 222 L470 260" strokeWidth="18" />
            <path d="M92 360 L40 300 L62 230 L12 168 L20 90" strokeWidth="20" />
            <path d="M300 132 L232 84 L246 10" strokeWidth="16" />
            <path d="M330 368 L320 450 L360 510" strokeWidth="12" />
            <path d="M62 230 L130 200 L150 140" strokeWidth="12" />
          </g>
          <g id="rift-cube">
            <polygon points="0,-9 10,-4 0,1 -10,-4" fill="#ecb0ff" />
            <polygon points="-10,-4 0,1 0,13 -10,8" fill="#9a2fe6" />
            <polygon points="10,-4 0,1 0,13 10,8" fill="#6c1db8" />
          </g>
          <g id="rift">
            <g fill="none" stroke="#c43dff" strokeLinejoin="miter" strokeLinecap="square" opacity=".5" filter="url(#rift-glow)">
              <use href="#rift-branches" />
            </g>
            <g fill="none" stroke="url(#rift-gradient)" strokeLinejoin="miter" strokeLinecap="square">
              <use href="#rift-branches" />
            </g>
            <path
              d="M-10 462 L62 432 L94 364 L172 336 L200 256 L282 216 L302 136 L382 96 L410 10"
              fill="none"
              stroke="#f3c4ff"
              strokeWidth="2"
              strokeDasharray="14 8 3 8"
              opacity=".7"
            />
            {[[210, 230], [352, 70], [110, 390], [455, 235], [40, 200], [380, 445]].map(([x, y]) => (
              <use key={`${x}-${y}`} href="#rift-cube" x={x} y={y} />
            ))}
          </g>
        </defs>
        <use href="#rift" />
      </svg>
      <svg className="rift rift--br theme-dark-only" viewBox="0 0 600 600" aria-hidden="true">
        <use href="#rift" />
      </svg>

      <CogCluster corner="tl" />
      <CogCluster corner="br" />
    </>
  )
}

const COGS = cornerCogs()
/** Seconds per turn for each tooth: meshing gears then turn at matching speeds. */
const SECONDS_PER_TOOTH = 5

/** Light theme: brass gears turning in a corner, in place of the rift branches. */
function CogCluster({ corner }: { corner: 'tl' | 'br' }) {
  return (
    <svg className={`cogs cogs--${corner} theme-light-only`} viewBox="0 0 520 520" aria-hidden="true" opacity=".3">
      {COGS.map(({ cx, cy, teeth, phase, reverse }) => {
        const p = pitchRadius(teeth)
        const spin = {
          '--spin': `${teeth * SECONDS_PER_TOOTH}s`,
          transformBox: 'view-box',
          transformOrigin: `${cx}px ${cy}px`,
        } as CSSProperties
        return (
          <g key={teeth} transform={`rotate(${phase} ${cx} ${cy})`}>
            <g className={reverse ? 'anim-cog-rev' : 'anim-cog'} style={spin}>
              <path d={cogPath(cx, cy, teeth)} fillRule="evenodd" fill="#c4964a" stroke="#6e4c1a" strokeWidth="1" />
              <circle cx={cx} cy={cy} r={p * 0.82} fill="none" stroke="#6e4c1a" strokeWidth="2" opacity=".45" />
              <circle cx={cx} cy={cy} r={p * 0.3} fill="none" stroke="#6e4c1a" strokeWidth="2" opacity=".6" />
            </g>
          </g>
        )
      })}
    </svg>
  )
}
