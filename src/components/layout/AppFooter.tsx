import { Link } from '@tanstack/react-router'
import { useT } from '#/i18n/index.ts'

export function AppFooter({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  const t = useT()

  return (
    <footer className="flex flex-col items-center gap-2 text-center text-sm text-muted print:hidden">
      <p>{t.footer.credit}</p>
      <div className="flex flex-wrap items-center justify-center gap-x-6">
        <Link to="/about" className="clickable flex min-h-11 items-center">
          {t.about.title}
        </Link>
        {/* Phones have no keyboard to use them with. */}
        <button
          type="button"
          className="clickable hidden cursor-pointer md:inline"
          onClick={onShowShortcuts}
        >
          {t.shortcuts.title}
        </button>
      </div>
    </footer>
  )
}
