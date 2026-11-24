import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ECHO_MAX_LENGTH } from '#/lib/echo.ts'
import { reportEcho } from '#/lib/echoes.functions.ts'

/** Mount it to open it. Escape, Cancel and a successful report call onClose. */
export function ReportEchoDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const [description, setDescription] = useState('')
  const report = useMutation({
    mutationFn: () => reportEcho({ data: { description } }),
    onSuccess: () => {
      onClose()
      return router.invalidate()
    },
  })

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="report-echo-title"
      className="m-auto w-full max-w-lg rounded-[18px] border-2 border-edge bg-panel p-6 text-fg backdrop:bg-black/60"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          report.mutate()
        }}
      >
        <h2 id="report-echo-title" className="font-display text-[1.6rem] font-bold">
          Report echo
        </h2>
        <label className="flex flex-col gap-2 text-muted">
          What did you notice?
          <textarea
            className="min-h-32 rounded-xl border-2 border-edge bg-well p-3 text-fg"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            maxLength={ECHO_MAX_LENGTH}
          />
        </label>
        {report.isError && (
          <p role="alert" className="text-magenta">
            {report.error.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="min-h-12 cursor-pointer px-4 text-muted hover:text-cyan"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-12 cursor-pointer rounded-xl bg-copper px-5.5 py-3 font-bold text-[#1a0f08] hover:brightness-110 disabled:opacity-50"
            disabled={report.isPending}
          >
            Report
          </button>
        </div>
      </form>
    </dialog>
  )
}
