import { useId, type ReactNode } from 'react'
import { useStoredFlag } from '#/lib/hooks/useStoredFlag.ts'

type Props = {
  title: string
  count: number
  /** Remembers in this browser whether the section is collapsed. */
  storageKey: string
  /** Stays visible while the section is collapsed. */
  action?: ReactNode
  children: ReactNode
}

export function CollapsibleSection({ title, count, storageKey, action, children }: Props) {
  const titleId = useId()
  const contentId = useId()
  const [isCollapsed, setIsCollapsed] = useStoredFlag(`collapsed:${storageKey}`)

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="font-display text-[1.6rem] font-bold">
          <button
            type="button"
            className="flex min-h-11 cursor-pointer items-center gap-3 hover:text-highlight"
            aria-expanded={!isCollapsed}
            aria-controls={contentId}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
              className={`text-muted ${isCollapsed ? '-rotate-90' : ''}`}
            >
              <path d="M2 4.5 L7 10 L12 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>
              {title}
              <span className="ml-2 font-sans text-base font-normal text-muted tabular-nums">{count}</span>
            </span>
          </button>
        </h2>
        {action}
      </div>
      <div id={contentId} hidden={isCollapsed}>
        {children}
      </div>
    </section>
  )
}
