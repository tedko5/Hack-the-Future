import { X, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Language } from '#/i18n/language.ts'
import { useT } from '#/i18n/index.ts'
import { askCodex, SUGGESTED_QUESTIONS } from '#/lib/chat.ts'

type Message = {
  role: 'user' | 'assistant'
  content: string
  /** Follow-up questions to offer as suggestions under this message. */
  related?: string[]
}

// Theme variables (styles.css); used as CSS `color` so they switch with the theme.
const ORACLE_COLOR = 'var(--oracle)'
const GUARDIAN_COLOR = 'var(--guardian)'

/** Floating chat with the Oracle. Answers come from the knowledge base, in the browser. */
export function OracleChat({ language }: { language: Language }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t.oracle.greeting, related: SUGGESTED_QUESTIONS[language] },
  ])
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLOListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function send(text: string) {
    const content = text.trim()
    if (!content) return
    const { answer, related } = askCodex(content, language)
    const reply: Message = answer
      ? { role: 'assistant', content: answer }
      : {
          role: 'assistant',
          content: `${t.oracle.unknown} ${related.length ? t.oracle.perhaps : t.oracle.tryThese}`,
          related: related.length ? related : SUGGESTED_QUESTIONS[language],
        }
    setMessages((m) => [...m, { role: 'user', content }, reply])
    setDraft('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(draft)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-40 md:bottom-4 flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border-2 border-edge bg-panel py-1.5 pr-5 pl-2.5 font-display text-lg font-bold shadow-[0_8px_24px_rgb(0_0_0/0.45)] hover:border-edge-hover"
      >
        <OracleSigil size={34} />
        {t.oracle.open}
      </button>
    )
  }

  const last = messages.length - 1

  return (
    <section
      aria-label={t.oracle.label}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      className="fixed inset-x-4 bottom-20 z-40 md:bottom-4 flex max-h-[min(70vh,560px)] flex-col gap-3 rounded-[18px] border-2 border-edge bg-panel p-3 shadow-[0_12px_40px_rgb(0_0_0/0.55)] sm:left-auto sm:w-[400px]"
    >
      <header className="flex items-center justify-between gap-3 pl-1">
        <h2 className="flex items-center gap-2.5 font-display text-[1.6rem] leading-none font-bold">
          <OracleSigil size={36} />
          {t.oracle.name}
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t.oracle.close}
          className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-fg"
        >
          <X size={20} />
        </button>
      </header>

      {/* Transcript on a ley line, like the echo timeline: a rune per message, the speaker above the text. */}
      <ol ref={listRef} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto rounded-xl border-2 border-edge bg-well px-3 pt-4">
        {messages.map((m, i) => {
          const oracle = m.role === 'assistant'
          return (
            <li key={i} className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3">
              <span className="relative flex justify-center">
                <span aria-hidden="true" className={`absolute left-1/2 w-0.5 -translate-x-1/2 bg-ley ${i === 0 ? 'top-2.5' : 'top-0'} ${i === last ? 'h-2.5' : 'bottom-0'}`} />
                <MessageRune oracle={oracle} />
              </span>
              <div className="min-w-0 pb-5">
                <p className="font-display text-[.95rem] leading-tight font-bold" style={{ color: oracle ? ORACLE_COLOR : GUARDIAN_COLOR }}>
                  {oracle ? t.oracle.name : t.common.you}
                </p>
                <p className={`mt-1 leading-snug ${oracle ? 'text-fg' : 'text-soft'}`}>{m.content}</p>

                {/* Only the latest message offers suggestions, so old ones don't pile up. */}
                {i === last && m.related && (
                  <ul className="mt-2.5 flex flex-col">
                    {m.related.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          onClick={() => send(q)}
                          className="flex min-h-9 w-full cursor-pointer items-center gap-2.5 py-1 text-left text-[.92rem] text-soft hover:text-fg"
                        >
                          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" className="shrink-0">
                            <polygon points="4,0 8,4 4,8 0,4" fill="none" stroke={ORACLE_COLOR} strokeWidth="1.3" />
                          </svg>
                          <span className="underline decoration-ley underline-offset-4">{q}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <form onSubmit={onSubmit} className="flex gap-2">
        <label htmlFor="oracle-input" className="sr-only">
          {t.oracle.question}
        </label>
        <input
          id="oracle-input"
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          autoComplete="off"
          placeholder={t.oracle.placeholder}
          className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-edge bg-well px-3.5 text-fg placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label={t.common.send}
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-copper text-on-copper hover:brightness-110 disabled:cursor-default disabled:opacity-50"
        >
          <SendHorizontal size={20} />
        </button>
      </form>
    </section>
  )
}

/** The Oracle's mark: an eye inside a slowly turning rune ring, like the desync sigil. */
function OracleSigil({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0" style={{ color: ORACLE_COLOR }}>
      <g className="anim-spin-sigil" fill="none" stroke="currentColor">
        <circle cx="20" cy="20" r="18" strokeWidth="1.5" strokeDasharray="7 3 1 3" />
        <circle cx="20" cy="20" r="13.5" strokeWidth="1" opacity=".55" />
      </g>
      <path d="M10.5 20 Q20 11.5 29.5 20 Q20 28.5 10.5 20 Z" className="fill-well" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="3.4" fill="currentColor" />
    </svg>
  )
}

/** Rune where a message joins the line: a diamond for the Oracle, a circle for the guardian. */
function MessageRune({ oracle }: { oracle: boolean }) {
  const color = oracle ? ORACLE_COLOR : GUARDIAN_COLOR
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="relative mt-px" style={{ color }}>
      {oracle ? (
        <>
          <polygon points="9,1.5 16.5,9 9,16.5 1.5,9" className="fill-well" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <polygon points="9,5.5 12.5,9 9,12.5 5.5,9" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="9" cy="9" r="7.2" className="fill-well" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="9" cy="9" r="3.2" fill="currentColor" />
        </>
      )}
    </svg>
  )
}
