import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { getGlitches } from '#/lib/glitches.functions.ts'
import { EVERYONE } from '#/lib/message.ts'
import { useShortcuts } from '#/lib/useShortcuts.ts'

const HELP = [
  ['j', 'Next glitch'],
  ['k', 'Previous glitch'],
  ['r', 'Report an echo, or add an update on a glitch page'],
  ['/', 'Search'],
  ['h', 'Mission control'],
  ['m', 'Messages'],
  ['n', 'Notifications'],
  ['l', 'Leaderboard'],
  ['p', 'Report for the High Council'],
  ['?', 'Show these shortcuts'],
] as const

type Props = {
  isHelpOpen: boolean
  onHelpChange: (isOpen: boolean) => void
}

/** The shortcuts that work on every page. Pages add their own with useShortcuts. */
export function KeyboardShortcuts({ isHelpOpen, onHelpChange }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  /** Steps through the glitches, newest first. From another page, it starts at the newest. */
  async function openGlitch(step: 1 | -1) {
    const glitches = await getGlitches()
    const currentId = /^\/glitches\/([^/]+)/.exec(pathname)?.[1]
    const index = glitches.findIndex(({ glitchId }) => glitchId === currentId)
    const target = index === -1 ? glitches[0] : glitches[index + step]
    if (target) {
      await navigate({ to: '/glitches/$glitchId', params: { glitchId: target.glitchId } })
    }
  }

  useShortcuts({
    j: () => void openGlitch(1),
    k: () => void openGlitch(-1),
    '/': focusSearch,
    h: () => void navigate({ to: '/' }),
    m: () =>
      void navigate({ to: '/messages/$conversationId', params: { conversationId: EVERYONE } }),
    n: () => void navigate({ to: '/notifications' }),
    l: () => void navigate({ to: '/leaderboard' }),
    p: () => void navigate({ to: '/report' }),
    '?': () => onHelpChange(true),
  })

  return isHelpOpen ? <HelpDialog onClose={() => onHelpChange(false)} /> : null
}

function focusSearch() {
  const inputs = [...document.querySelectorAll<HTMLInputElement>('input[type=search]')]
  // Skips the ones in a collapsed section.
  const input = inputs.find((candidate) => candidate.offsetParent !== null)
  input?.focus()
  input?.scrollIntoView({ block: 'center' })
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="shortcuts-title"
      className="m-auto w-full max-w-md rounded-[18px] border-2 border-edge bg-panel p-6 text-fg backdrop:bg-black/60"
    >
      <h2 id="shortcuts-title" className="font-display text-[1.6rem] font-bold">
        Keyboard shortcuts
      </h2>
      <dl className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5">
        {HELP.map(([key, description]) => (
          <div key={key} className="contents">
            <dt>
              <kbd className="inline-flex min-w-8 justify-center rounded-md border border-edge bg-well px-2 py-1 font-sans text-sm">
                {key}
              </kbd>
            </dt>
            <dd className="text-muted">{description}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        className="mt-5 min-h-12 w-full cursor-pointer rounded-xl bg-copper font-bold text-on-copper hover:brightness-110"
        onClick={onClose}
      >
        Close
      </button>
    </dialog>
  )
}
