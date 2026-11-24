import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { ImageAttachment } from '#/components/images/Attachment.tsx'
import { ImageButton } from '#/components/images/ImageButton.tsx'
import { useImageAttachment } from '#/components/images/useImageAttachment.ts'
import { Dialog } from '#/components/ui/Dialog.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import { ECHO_MAX_LENGTH } from '#/lib/echo.ts'
import { reportEcho } from '#/lib/echoes.functions.ts'
import { GLITCH_STATUSES, type Glitch, type GlitchStatus } from '#/lib/glitch.ts'

const KEEP_STATUS = ''

type Props = {
  /** Adds an update to this glitch. Without it, the echo opens a new glitch. */
  glitch?: Glitch
  /** Whether the update may also change the glitch's status. */
  canChangeStatus?: boolean
  onClose: () => void
}

/** Mount it to open it. Escape, Cancel and a successful report call onClose. */
export function ReportEchoDialog({ glitch, canChangeStatus = false, onClose }: Props) {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<GlitchStatus | typeof KEEP_STATUS>(KEEP_STATUS)
  const attachment = useImageAttachment()
  const { image, pickImage, pasteImage, removeImage } = attachment
  const report = useMutation({
    mutationFn: () => {
      const data = new FormData()
      data.set('description', description)
      if (glitch) data.set('glitchId', glitch.glitchId)
      if (status) data.set('status', status)
      if (image) data.set('image', image)
      return reportEcho({ data })
    },
    onSuccess: () => {
      onClose()
      return router.invalidate()
    },
  })

  const error = report.error ?? attachment.error
  const isBusy = report.isPending || attachment.isPreparing

  return (
    <Dialog
      title={glitch ? t.echoes.updateTitle(glitch.glitchId) : t.echoes.report}
      onClose={onClose}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          report.mutate()
        }}
      >
        <label className="flex flex-col gap-2 text-muted">
          {t.echoes.question}
          <textarea
            className="min-h-32 rounded-xl border-2 border-edge bg-well p-3 text-fg"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onPaste={pasteImage}
            required
            maxLength={ECHO_MAX_LENGTH}
          />
        </label>
        {glitch && canChangeStatus && (
          <label className="flex flex-col gap-2 text-muted">
            {t.common.status}
            <select
              className="min-h-12 rounded-xl border-2 border-edge bg-well px-3 text-fg"
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
            >
              <option value={KEEP_STATUS}>{t.echoes.keepStatus(t.status[glitch.status])}</option>
              {GLITCH_STATUSES.filter((option) => option !== glitch.status).map((option) => (
                <option key={option} value={option}>
                  {t.status[option]}
                </option>
              ))}
            </select>
          </label>
        )}
        {image && <ImageAttachment image={image} onRemove={removeImage} />}
        {error && (
          <p role="alert" className="text-magenta">
            {format.error(error)}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="mr-auto">
            <ImageButton disabled={isBusy} onPick={pickImage} />
          </div>
          <button
            type="button"
            className="min-h-12 cursor-pointer px-4 text-muted hover:text-highlight"
            onClick={onClose}
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            className="min-h-12 cursor-pointer rounded-xl bg-copper px-5.5 py-3 font-bold text-on-copper hover:brightness-110 disabled:opacity-50"
            disabled={isBusy}
          >
            {glitch ? t.echoes.addUpdate : t.echoes.submit}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
