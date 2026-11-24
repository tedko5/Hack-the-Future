import { useRouter } from '@tanstack/react-router'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useFormat, useT } from '#/i18n/index.ts'
import type { Echo } from '#/lib/echo.ts'
import { HACK_SUCCESS_CHANCE, canHack } from '#/lib/glitch.ts'
import { hackGlitch } from '#/lib/glitches.functions.ts'
import { DISTRICTS } from '#/lib/map.ts'
import type { MapGlitch } from './AchronaMap.tsx'

type Tone = 'out' | 'cmd' | 'dim' | 'accent' | 'ok' | 'err'
type Line = { id: number; text: string; tone: Tone }

const TONES: Record<Tone, string> = {
  out: 'text-soft',
  cmd: 'text-fg',
  dim: 'text-muted',
  accent: 'text-highlight',
  ok: 'font-bold text-(--status-fixed)',
  err: 'font-bold text-(--status-leaked)',
}

/** Typed the same in every language. What they do is in the dictionaries. */
const COMMANDS = ['help', 'scan', 'trace', 'decrypt', 'breach', 'inject', 'clear', 'exit'] as const
type Command = (typeof COMMANDS)[number]

const PROMPT = 'commander@achrona:~$'
/** Buttons under the terminal on phones. breach only fills in the input, it needs a code. */
const QUICK_COMMANDS: Command[] = ['help', 'scan', 'breach', 'inject', 'trace', 'decrypt', 'clear']
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A label and its value, as in the output of scan and trace. */
const row = (label: string, value: string): [string] => [`  ${label.padEnd(12)}${value}`]

/** A new ward frequency for every session, like 7F3. */
function makeFrequency() {
  return Math.floor(0x100 + Math.random() * 0xeff)
    .toString(16)
    .toUpperCase()
}

type Props = {
  glitch: MapGlitch
  /** Leave out to hack in through the glitch itself, e.g. when it has no echoes yet. */
  echo?: Echo
  /** Magic now and if this glitch were fixed, for the result line. */
  magic: number
  magicIfFixed: number
  onFixed: () => void
  onClose: () => void
}

/**
 * The commander types commands to hack into an echo. Scanning reveals the ward frequency,
 * breaching with it unlocks inject, and inject makes the one random attempt on the server.
 */
export function HackTerminal({ glitch, echo, magic, magicIfFixed, onFixed, onClose }: Props) {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const screen = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)
  const [frequency] = useState(makeFrequency)
  const [lines, setLines] = useState<Line[]>(() => banner())
  const [value, setValue] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const [isBreached, setIsBreached] = useState(false)
  const [hasHacked, setHasHacked] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>()

  function banner(): Line[] {
    const make = (text: string, tone: Tone): Line => ({ id: nextId.current++, text, tone })
    return [
      make(t.hack.banner, 'accent'),
      make(
        echo ? t.hack.lockedOnEcho(echo.echoId, glitch.glitchId) : t.hack.lockedOn(glitch.glitchId),
        'out',
      ),
      make(
        `${t.common.status} ${t.status[glitch.status].toUpperCase()} · ${t.map.districts[glitch.district.id]}`,
        'out',
      ),
      make(t.hack.typeHelp, 'dim'),
    ]
  }

  useEffect(() => {
    dialog.current?.showModal()
    input.current?.focus()
  }, [])

  // Only when output arrives or a command ends, not on every keystroke.
  useEffect(() => {
    if (!isBusy) input.current?.focus({ preventScroll: true })
    screen.current?.scrollTo({ top: screen.current.scrollHeight })
  }, [lines, isBusy])

  const print = (text: string, tone: Tone = 'out') =>
    setLines((current) => [...current, { id: nextId.current++, text, tone }])

  /** Prints lines one by one, like a slow uplink. */
  async function stream(entries: [string, Tone?][], delay = 180) {
    for (const [text, tone] of entries) {
      await sleep(delay)
      print(text, tone)
    }
  }

  async function run(raw: string) {
    const [name = '', ...args] = raw.trim().split(/\s+/)
    const command = name.toLowerCase()
    print(`${PROMPT} ${raw}`, 'cmd')
    if (!command) return

    switch (command as Command) {
      case 'help':
        for (const key of COMMANDS) {
          print(`  ${key.padEnd(9)}${t.hack.commands[key]}`, key === 'inject' ? 'accent' : 'out')
        }
        return
      case 'clear':
        setLines([])
        return
      case 'exit':
        dialog.current?.close()
        return
      case 'scan':
        await stream([
          [t.hack.scanning, 'dim'],
          ...(echo
            ? [
                row(t.hack.rows.echo, `#${echo.echoId} · ${format.dateTime(echo.timestamp)}`),
                row(t.hack.rows.reporter, `${echo.reporter.codename} (${echo.reporter.role})`),
              ]
            : [row(t.hack.rows.leaked, format.dateTime(glitch.timestamp))]),
          row(t.hack.rows.glitch, `${glitch.glitchId} · ${t.status[glitch.status]}`),
          row(t.hack.rows.echoes, t.hack.onThisGlitch(glitch.echoes.length)),
          row(t.hack.rows.assigned, glitch.assignedCodename ?? t.hack.nobody),
          [t.hack.frequency(frequency), 'accent'],
        ])
        setHasScanned(true)
        return
      case 'trace': {
        const [heart] = DISTRICTS
        const strides = Math.round(Math.hypot(glitch.x - heart.x, glitch.y - heart.y))
        await stream([
          [t.hack.tracing, 'dim'],
          row(t.hack.rows.district, t.map.districts[glitch.district.id]),
          row(t.hack.rows.grid, `${Math.round(glitch.x)}.${Math.round(glitch.y)}`),
          row(t.hack.rows.leyLine, t.hack.strides(strides)),
        ])
        return
      }
      case 'decrypt':
        await stream([[t.hack.decoding, 'dim']], 300)
        await stream([[`  "${echo?.description ?? glitch.description}"`, 'out']], 400)
        return
      case 'breach':
        await breach(args[0])
        return
      case 'inject':
        await inject()
        return
      default:
        print(t.hack.notFound(command), 'err')
    }
  }

  async function breach(code: string | undefined) {
    if (isBreached) return print(t.hack.alreadyDown, 'dim')
    if (!hasScanned) return print(t.hack.scanFirst, 'err')
    if (!code) return print(t.hack.breachUsage, 'err')
    await stream([[t.hack.tuning(code.toUpperCase()), 'dim']], 300)
    if (code.toUpperCase() !== frequency) {
      return print(t.hack.wrongFrequency, 'err')
    }
    await stream([[`${t.hack.collapsing} █████████ 100%`, 'accent'], [t.hack.armed, 'ok']])
    setIsBreached(true)
  }

  async function inject() {
    if (glitch.status === 'FIXED') return print(t.hack.alreadyFixed, 'dim')
    if (hasHacked || !canHack(glitch)) {
      return print(t.hack.lockedOut, 'err')
    }
    if (!isBreached) return print(t.hack.breachFirst, 'err')

    setHasHacked(true)
    const attempt = hackGlitch({ data: { glitchId: glitch.glitchId } })
    // Keeps the error until the steps have printed, so it cannot go unhandled meanwhile.
    attempt.catch(() => {})
    await stream(
      [
        [t.hack.opening, 'dim'],
        [`${t.hack.injecting}  ▓▓▓░░░░░░`, 'dim'],
        [`${t.hack.injecting}  ▓▓▓▓▓▓░░░`, 'dim'],
        [`${t.hack.injecting}  ▓▓▓▓▓▓▓▓▓`, 'dim'],
        [t.hack.odds(Math.round(HACK_SUCCESS_CHANCE * 100)), 'accent'],
      ],
      550,
    )
    try {
      // Before the result prints: refreshing the page puts the terminal's scroll position back.
      const result = await attempt.finally(() => router.invalidate())
      await sleep(600)
      if (result === 'SUCCESS') {
        print(t.hack.success, 'ok')
        print(t.hack.desyncReduced(magic, magicIfFixed), 'ok')
        onFixed()
      } else {
        print(t.hack.denied, 'err')
        print(t.hack.sendDefender, 'err')
      }
    } catch (error) {
      print(t.hack.connectionLost(format.error(error as Error)), 'err')
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void submit(value)
  }

  async function submit(raw: string) {
    if (isBusy) return
    setValue('')
    setHistoryIndex(undefined)
    if (raw.trim()) setHistory((current) => [...current, raw])
    setIsBusy(true)
    try {
      await run(raw)
    } finally {
      setIsBusy(false)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      if (history.length === 0) return
      const last = history.length - 1
      const index =
        event.key === 'ArrowUp'
          ? Math.max(0, (historyIndex ?? history.length) - 1)
          : historyIndex === undefined || historyIndex >= last
            ? undefined
            : historyIndex + 1
      setHistoryIndex(index)
      setValue(index === undefined ? '' : history[index])
    } else if (event.key === 'Tab') {
      event.preventDefault()
      const match = COMMANDS.find((command) => command.startsWith(value.trim()))
      if (value.trim() && match) setValue(`${match} `)
    }
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label={t.hack.terminalFor(glitch.glitchId)}
      className="mx-auto mt-3 mb-auto w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden sm:m-auto rounded-xl border-2 border-edge bg-well p-0 text-fg backdrop:bg-black/70"
    >
      <div className="flex items-center gap-3 border-b-2 border-edge bg-row px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="size-3 rounded-full bg-(--status-leaked)" />
          <i className="size-3 rounded-full bg-(--status-containing)" />
          <i className="size-3 rounded-full bg-(--status-fixed)" />
        </span>
        <span className="flex-1 truncate font-mono text-[.8rem] text-muted">
          achrona://{glitch.glitchId.toLowerCase()}
          {echo && `/echo-${echo.echoId}`}
        </span>
        <button
          type="button"
          className="min-h-9 cursor-pointer rounded-lg px-2 text-sm text-muted hover:text-highlight"
          onClick={() => dialog.current?.close()}
        >
          {t.common.close}
        </button>
      </div>

      <div
        ref={screen}
        role="log"
        aria-live="polite"
        className="hack-console h-[min(26rem,50dvh)] overflow-y-auto px-3 py-3 font-mono text-[.78rem] leading-relaxed sm:h-[min(26rem,60vh)] sm:px-4 sm:text-[.82rem]"
        onClick={() => input.current?.focus()}
      >
        {lines.map((line) => (
          <p key={line.id} className={`hack-line break-words whitespace-pre-wrap ${TONES[line.tone]}`}>
            {line.text}
          </p>
        ))}
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <label htmlFor="hack-input" className="shrink-0 text-highlight">
            {/* The full prompt leaves too little room to type on a phone. */}
            <span className="hidden sm:inline">{PROMPT.replace('~$', '')}</span>~$
          </label>
          <input
            ref={input}
            id="hack-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={isBusy}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            // 16px on phones, or iOS zooms in on focus.
            className="hack-input min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-base text-fg caret-highlight sm:text-[.82rem]"
          />
        </form>
      </div>

      {/* Typing on a phone is slow: the commands are one tap away. */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-t-2 border-edge bg-row px-3 py-2.5 sm:hidden">
        {QUICK_COMMANDS.map((command) => (
          <button
            key={command}
            type="button"
            disabled={isBusy}
            className={`min-h-10 shrink-0 cursor-pointer rounded-lg border-2 px-3 font-mono text-sm disabled:opacity-50 ${
              command === 'inject' ? 'border-highlight text-highlight' : 'border-edge text-soft'
            }`}
            onClick={() => {
              if (command === 'breach') {
                setValue('breach ')
                input.current?.focus()
              } else {
                void submit(command)
              }
            }}
          >
            {command}
          </button>
        ))}
      </div>
    </dialog>
  )
}
