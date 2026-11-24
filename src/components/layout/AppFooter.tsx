export function AppFooter({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  return (
    <footer className="flex flex-col items-center gap-2 text-center text-sm text-muted print:hidden">
      <p>Developed for the Hack the Future hackathon by Teodor and Vivian (team Clown car)</p>
      {/* Phones have no keyboard to use them with. */}
      <button
        type="button"
        className="clickable hidden cursor-pointer md:inline"
        onClick={onShowShortcuts}
      >
        Keyboard shortcuts
      </button>
    </footer>
  )
}
