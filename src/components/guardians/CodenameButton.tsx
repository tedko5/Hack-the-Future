import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogActions } from '#/components/ui/Dialog.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import { CODENAME_MAX_LENGTH, CODENAME_MIN_LENGTH } from '#/lib/schemas/guardian.ts'
import { changeCodename } from '#/lib/functions/guardians.functions.ts'

/** Your own codename. Opens a dialog to change it. */
export function CodenameButton({ codename }: { codename: string }) {
  const t = useT()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        title={t.codename.change}
        className="flex cursor-pointer items-center gap-1.5 text-left text-[0.95rem] font-bold hover:text-highlight"
        onClick={() => setIsOpen(true)}
      >
        {codename}
        <Pencil size={13} aria-label={t.codename.change} className="shrink-0 text-muted" />
      </button>
      {isOpen && <CodenameDialog codename={codename} onClose={() => setIsOpen(false)} />}
    </>
  )
}

function CodenameDialog({ codename, onClose }: { codename: string; onClose: () => void }) {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  const [value, setValue] = useState(codename)
  const save = useMutation({
    mutationFn: () => changeCodename({ data: { codename: value } }),
    onSuccess: () => {
      onClose()
      return router.invalidate()
    },
  })

  return (
    <Dialog title={t.codename.change} onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate()
        }}
      >
        <label className="flex flex-col gap-2 text-muted">
          {t.common.codename}
          <input
            className="min-h-11 rounded-xl border-2 border-edge bg-well px-3 text-fg"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
            minLength={CODENAME_MIN_LENGTH}
            maxLength={CODENAME_MAX_LENGTH}
          />
        </label>
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
