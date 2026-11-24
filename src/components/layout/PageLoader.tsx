import { useRouterState } from '@tanstack/react-router'
import { useT } from '#/i18n/index.ts'

/** Twelve runes, one per segment of the Desync Well. */
const RUNES = Array.from({ length: 12 }, (_, index) => index * 30)

/**
 * Dims the page and turns a rune circle while the next page loads. Only when going to another
 * page: live updates refresh the current one all the time.
 */
export function PageLoader() {
  const t = useT()
  const isLoading = useRouterState({
    select: ({ status, location, resolvedLocation }) =>
      status === 'pending' &&
      resolvedLocation !== undefined &&
      resolvedLocation.pathname !== location.pathname,
  })

  return (
    // Always there, so screen readers announce what appears in it.
    <div role="status">
      {isLoading && (
        <div className="page-loader pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-app/60 text-highlight">
          <RuneCircle />
          <span className="rounded-full bg-panel px-4 py-1.5 font-display text-lg font-bold">
            {t.common.loading}
          </span>
        </div>
      )}
    </div>
  )
}

function RuneCircle() {
  return (
    <svg
      viewBox="-60 -60 120 120"
      width="132"
      height="132"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="page-loader-glow"
    >
      <circle r="58" stroke="none" className="fill-panel" />
      <g className="page-loader-ring">
        <circle r="54" />
        {RUNES.map((angle) => (
          <path key={angle} d="M0,-51 L4,-46 L0,-41 L-4,-46 Z" transform={`rotate(${angle})`} />
        ))}
        <circle r="38" strokeDasharray="3 5" />
      </g>
      <g className="page-loader-star" strokeLinejoin="round">
        <rect x="-23" y="-23" width="46" height="46" />
        <rect x="-23" y="-23" width="46" height="46" transform="rotate(45)" />
      </g>
      <path
        className="page-loader-crystal"
        d="M0,-15 9,-6 V6 L0,15 -9,6 V-6 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}
