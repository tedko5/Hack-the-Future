import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog.tsx'
import { EditRemoveButtons } from '#/components/ui/EditRemoveButtons.tsx'
import { EditTextDialog } from '#/components/ui/EditTextDialog.tsx'
import { useT } from '#/i18n/index.ts'
import { ECHO_MAX_LENGTH, canEditEcho, type Echo } from '#/lib/echo.ts'
import { editEcho, removeEcho } from '#/lib/echoes.functions.ts'

const appRoute = getRouteApi('/_app')

/** Editing for authors and commanders, removing for commanders. The server checks it too. */
export function EchoActions({ echo }: { echo: Echo }) {
  const { guardian } = appRoute.useRouteContext()
  const t = useT()
  const [open, setOpen] = useState<'edit' | 'remove' | null>(null)
  const { echoId } = echo
  const close = () => setOpen(null)

  if (!canEditEcho(guardian, echo.reporter.guardianId)) return null
  return (
    <>
      <EditRemoveButtons
        onEdit={() => setOpen('edit')}
        onRemove={guardian.role === 'commander' ? () => setOpen('remove') : undefined}
      />
      {open === 'edit' && (
        <EditTextDialog
          title={t.echoes.editTitle}
          text={echo.description}
          maxLength={ECHO_MAX_LENGTH}
          onSave={(description) => editEcho({ data: { echoId, description } })}
          onClose={close}
        />
      )}
      {open === 'remove' && (
        <ConfirmDialog
          title={t.echoes.removeTitle}
          warning={t.echoes.removeWarning}
          confirmLabel={t.common.remove}
          onConfirm={() => removeEcho({ data: { echoId } })}
          onClose={close}
        />
      )}
    </>
  )
}
