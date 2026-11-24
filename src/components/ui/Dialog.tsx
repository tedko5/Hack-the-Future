import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Mount it to open it. Escape calls onClose. */
export function Dialog({ title, onClose, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby={titleId}
      className="m-auto w-full max-w-lg rounded-[18px] border-2 border-edge bg-panel p-6 text-fg backdrop:bg-black/60"
    >
      <h2 id={titleId} className="mb-4 font-display text-[1.6rem] font-bold">
        {title}
      </h2>
      {children}
    </dialog>
  )
}

type ActionsProps = {
  cancelLabel: string
  submitLabel: string
  isBusy: boolean
  onCancel: () => void
}

/** The buttons of a form in a dialog. */
export function DialogActions({ cancelLabel, submitLabel, isBusy, onCancel }: ActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      <button
        type="button"
        className="min-h-12 cursor-pointer px-4 text-muted hover:text-highlight"
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        className="min-h-12 cursor-pointer rounded-xl bg-copper px-5.5 py-3 font-bold text-on-copper hover:brightness-110 disabled:opacity-50"
        disabled={isBusy}
      >
        {submitLabel}
      </button>
    </div>
  )
}
