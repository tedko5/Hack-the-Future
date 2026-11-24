import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Dialog, DialogActions } from '#/components/ui/Dialog.tsx'
import { useFormat, useT } from '#/i18n/index.ts'

type Props = {
  title: string
  warning: string
  confirmLabel: string
  onConfirm: () => Promise<unknown>
  onClose: () => void
}

/** Asks before something that cannot be undone, and shows why it failed if it does. */
export function ConfirmDialog({ title, warning, confirmLabel, onConfirm, onClose }: Props) {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  const confirm = useMutation({
    mutationFn: onConfirm,
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
          confirm.mutate()
        }}
      >
        <p className="text-muted">{warning}</p>
        {confirm.error && (
          <p role="alert" className="text-magenta">
            {format.error(confirm.error)}
          </p>
        )}
        <DialogActions
          cancelLabel={t.common.cancel}
          submitLabel={confirmLabel}
          isBusy={confirm.isPending}
          onCancel={onClose}
        />
      </form>
    </Dialog>
  )
}
