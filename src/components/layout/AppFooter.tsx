import { useT } from '#/i18n/index.ts'

export function AppFooter({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  const t = useT()

  return (
    <footer className="flex flex-col items-center gap-2 text-center text-sm text-muted print:hidden">
      <p>{t.footer.credit}</p>
      {/* Phones have no keyboard to use them with. */}
      <button
        type="button"
        className="clickable hidden cursor-pointer md:inline"
        onClick={onShowShortcuts}
      >
        {t.shortcuts.title}
      </button>
    </footer>
  )
}
