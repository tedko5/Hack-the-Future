import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { GLITCH_STATUSES, type Glitch, type GlitchStatus } from '#/lib/glitch.ts'
import { assignGlitch, setGlitchStatus } from '#/lib/glitches.functions.ts'
import type { Guardian } from '#/lib/guardian.ts'

const UNASSIGNED = ''

type Props = {
  glitch: Glitch
  guardians: Guardian[]
}

/** For commanders only: the server refuses these changes from anyone else. */
export function GlitchControls({ glitch, guardians }: Props) {
  const router = useRouter()
  const refresh = () => router.invalidate()
  const changeStatus = useMutation({
    mutationFn: (status: GlitchStatus) =>
      setGlitchStatus({ data: { glitchId: glitch.glitchId, status } }),
    onSettled: refresh,
  })
  const assign = useMutation({
    mutationFn: (guardianId: string | null) =>
      assignGlitch({ data: { glitchId: glitch.glitchId, guardianId } }),
    onSettled: refresh,
  })
  const error = changeStatus.error ?? assign.error

  // Someone promoted to commander after being assigned stays visible as the current choice.
  const assignable = guardians.filter(
    ({ role, guardianId }) => role === 'defender' || guardianId === glitch.assignedGuardianId,
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            className={selectClass}
            value={glitch.status}
            disabled={changeStatus.isPending}
            onChange={(event) => changeStatus.mutate(event.target.value as GlitchStatus)}
          >
            {GLITCH_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_STYLES[status].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assigned defender">
          <select
            className={selectClass}
            value={glitch.assignedGuardianId ?? UNASSIGNED}
            disabled={assign.isPending}
            onChange={(event) => assign.mutate(event.target.value || null)}
          >
            <option value={UNASSIGNED}>Unassigned</option>
            {assignable.map(({ guardianId, codename }) => (
              <option key={guardianId} value={guardianId}>
                {codename}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {error && (
        <p role="alert" className="text-magenta">
          {error.message}
        </p>
      )}
    </div>
  )
}

const selectClass =
  'min-h-12 rounded-xl border-2 border-edge bg-well px-3 text-fg disabled:opacity-50'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-muted">
      {label}
      {children}
    </label>
  )
}
