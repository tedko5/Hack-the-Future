import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog.tsx'
import { EditRemoveButtons } from '#/components/ui/EditRemoveButtons.tsx'
import { EditTextDialog } from '#/components/ui/EditTextDialog.tsx'
import { useT } from '#/i18n/index.ts'
import { ECHO_MAX_LENGTH } from '#/lib/schemas/echo.ts'
import type { Glitch } from '#/lib/schemas/glitch.ts'
import { editGlitch, removeGlitch } from '#/lib/functions/glitches.functions.ts'

/** For commanders, on the page of the glitch. The server checks it too. */
export function GlitchActions({ glitch }: { glitch: Glitch }) {
  const navigate = useNavigate()
  const t = useT()
  const [open, setOpen] = useState<'edit' | 'remove' | null>(null)
  const { glitchId } = glitch
  const close = () => setOpen(null)

  return (
    <>
      <EditRemoveButtons onEdit={() => setOpen('edit')} onRemove={() => setOpen('remove')} />
      {open === 'edit' && (
        <EditTextDialog
          title={t.glitches.editTitle(glitchId)}
          text={glitch.description}
          maxLength={ECHO_MAX_LENGTH}
          onSave={(description) => editGlitch({ data: { glitchId, description } })}
          onClose={close}
        />
      )}
      {open === 'remove' && (
        <ConfirmDialog
          title={t.glitches.removeTitle(glitchId)}
          warning={t.glitches.removeWarning}
          confirmLabel={t.common.remove}
          onConfirm={async () => {
            await removeGlitch({ data: { glitchId } })
            // Away from a page that no longer exists.
            await navigate({ to: '/' })
          }}
          onClose={close}
        />
      )}
    </>
  )
}
