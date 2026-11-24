import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Dialog, DialogActions } from '#/components/ui/Dialog.tsx'
import { useFormat, useT } from '#/i18n/index.ts'

type Props = {
  title: string
  text: string
  maxLength: number
  onSave: (text: string) => Promise<unknown>
  onClose: () => void
}

export function EditTextDialog({ title, text: initialText, maxLength, onSave, onClose }: Props) {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  const [text, setText] = useState(initialText)
  const save = useMutation({
    mutationFn: () => onSave(text),
    onSuccess: () => {
      onClose()
      return router.invalidate()
    },
  })

  return (
    <Dialog title={title} onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate()
        }}
      >
        <textarea
          aria-label={title}
          className="min-h-32 rounded-xl border-2 border-edge bg-well p-3 text-fg"
          value={text}
          onChange={(event) => setText(event.target.value)}
          required
          maxLength={maxLength}
        />
        {save.error && (
          <p role="alert" className="text-magenta">
            {format.error(save.error)}
          </p>
        )}
        <DialogActions
          cancelLabel={t.common.cancel}
          submitLabel={t.common.save}
          isBusy={save.isPending}
          onCancel={onClose}
        />
      </form>
    </Dialog>
  )
}
