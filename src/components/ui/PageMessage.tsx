import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useFormat, useT } from '#/i18n/index.ts'

function PageMessage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-auto my-16 flex w-[calc(100%-2rem)] max-w-xl flex-col items-start gap-4 rounded-[18px] bg-panel p-6">
      <h2 className="font-display text-[1.6rem] font-bold">{title}</h2>
      {children}
    </section>
  )
}

/** In place of a page that could not be loaded. */
export function PageError({ error }: ErrorComponentProps) {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  return (
    <PageMessage title={t.page.error}>
      {error instanceof Error && <p className="text-muted">{format.error(error)}</p>}
      <button
        type="button"
        className="min-h-12 cursor-pointer rounded-xl bg-copper px-5.5 py-3 font-bold text-on-copper hover:brightness-110"
        onClick={() => void router.invalidate()}
      >
        {t.page.retry}
      </button>
    </PageMessage>
  )
}

/** For an address that leads nowhere. */
export function PageNotFound() {
  const t = useT()
  return (
    <PageMessage title={t.page.notFound}>
      <Link to="/" className="clickable text-highlight">
        {t.glitches.back}
      </Link>
    </PageMessage>
  )
}
