import { Shape, type ShapeKind } from '#/components/ui/Shape.tsx'
import type { Echo } from '#/lib/echo.ts'
import type { GlitchStatus } from '#/lib/glitch.ts'

const STATUS: Record<GlitchStatus, { label: string; shape: ShapeKind; color: string; pill: string }> = {
  LEAKED: { label: 'Leaked', shape: 'square', color: '#ff3df0', pill: 'bg-[#2a1330] text-[#ff8af5]' },
  ASSESSING: { label: 'Assessing', shape: 'diamond', color: '#a77bff', pill: 'bg-[#251a52] text-[#c9b3ff]' },
  CONTAINING: { label: 'Containing', shape: 'triangle', color: '#d9803f', pill: 'bg-[#3a2414] text-[#f0a868]' },
  FIXED: { label: 'Fixed', shape: 'circle', color: '#4df3ff', pill: 'bg-[#0f2f45] text-cyan' },
}

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

type Props = {
  echoes: Echo[]
  onReport?: () => void
}

export function EchoList({ echoes, onReport }: Props) {
  return (
    <section aria-labelledby="echoes-title" className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="echoes-title" className="font-display text-[1.6rem] font-bold">
          Echoes
          <span className="ml-2 font-mono text-[.95rem] font-normal text-muted">{echoes.length}</span>
        </h2>
        <button
          type="button"
          onClick={onReport}
          className="min-h-12 w-full cursor-pointer rounded-xl bg-copper px-5.5 py-3 font-bold text-[#1a0f08] hover:brightness-110 sm:w-auto"
        >
          Report echo
        </button>
      </div>

      {echoes.length === 0 ? (
        <p className="rounded-xl border-2 border-edge bg-well p-6 text-muted">No echoes reported yet.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,330px),1fr))] gap-2.5 rounded-xl border-2 border-edge bg-well p-2.5 md:p-3.5">
          {echoes.map((echo) => (
            <EchoCard key={echo.echoId} echo={echo} />
          ))}
        </ul>
      )}
    </section>
  )
}

function EchoCard({ echo }: { echo: Echo }) {
  const status = STATUS[echo.glitch.status]
  const leaked = echo.glitch.status === 'LEAKED'

  return (
    <li
      className={`flex flex-col gap-2.5 rounded-[10px] p-3.5 ${
        leaked ? 'bg-[#241433] shadow-[inset_0_0_0_1px_rgb(255_61_240/0.45)]' : 'bg-row'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-2 rounded-full py-0.5 pr-3 pl-2.5 text-[.8rem] font-bold ${status.pill}`}>
          <Shape kind={status.shape} color={status.color} />
          {status.label}
        </span>
        {/* Server and browser time zones can differ; the browser's wins. */}
        <time dateTime={echo.timestamp} suppressHydrationWarning className="font-mono text-[.8rem] text-muted">
          {timeFormat.format(new Date(echo.timestamp))}
        </time>
      </div>
      <p className="leading-snug">{echo.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[.82rem] text-muted">
        <span>
          <b className="font-medium text-fg">{echo.reporter.codename}</b>
          <span className="ml-1.5 rounded-md bg-panel px-1.5 py-0.5 font-mono text-[.7rem]">{echo.reporter.role}</span>
        </span>
        <code className="font-mono text-[.78rem]">{echo.glitch.glitchId}</code>
      </div>
    </li>
  )
}
