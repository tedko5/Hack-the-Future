import type { Guardian } from '#/lib/guardian.ts'

export function AppHeader({ guardian }: { guardian: Guardian }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-5">
      <h1 className="title-engraved font-display text-[clamp(2.3rem,6vw,3.8rem)] leading-none font-bold">
        Achrona Mission Control
      </h1>
      <div className="flex items-center gap-3 rounded-xl bg-panel py-2 pr-2 pl-4">
        <div>
          <b className="block text-[0.95rem]">{guardian.codename}</b>
          <span className="text-[0.8rem] text-muted">Guardian</span>
        </div>
        <span className="rounded-lg bg-copper px-3 py-2 font-mono text-xs font-bold text-app">
          {guardian.role}
        </span>
        {/* TODO(auth): wire up once login exists */}
        <button type="button" className="min-h-11 cursor-pointer px-2 text-sm text-muted hover:text-cyan">
          Log out
        </button>
      </div>
    </header>
  )
}
