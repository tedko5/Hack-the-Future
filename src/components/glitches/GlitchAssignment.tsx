import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useFormat, useT } from '#/i18n/index.ts'
import type { Glitch } from '#/lib/schemas/glitch.ts'
import { assignGlitch, releaseGlitch, takeGlitch } from '#/lib/functions/glitches.functions.ts'
import type { Guardian } from '#/lib/schemas/guardian.ts'

const UNASSIGNED = ''

type CommanderProps = {
  glitch: Glitch
  guardians: Guardian[]
}

/** For commanders: assign the glitch to any defender. */
export function AssignDefender({ glitch, guardians }: CommanderProps) {
  const t = useT()
  const router = useRouter()
  const assign = useMutation({
    mutationFn: (guardianId: string | null) =>
      assignGlitch({ data: { glitchId: glitch.glitchId, guardianId } }),
    onSettled: () => router.invalidate(),
  })

  // Someone promoted to commander after being assigned stays visible as the current choice.
  const assignable = guardians.filter(
    ({ role, guardianId }) => role === 'defender' || guardianId === glitch.assignedGuardianId,
  )

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-2 text-muted sm:max-w-xs">
        {t.glitches.assignedDefender}
        <select
          className="min-h-12 rounded-xl border-2 border-edge bg-well px-3 text-fg disabled:opacity-50"
          value={glitch.assignedGuardianId ?? UNASSIGNED}
          disabled={assign.isPending}
          onChange={(event) => assign.mutate(event.target.value || null)}
        >
          <option value={UNASSIGNED}>{t.common.unassigned}</option>
          {assignable.map(({ guardianId, codename }) => (
            <option key={guardianId} value={guardianId}>
              {codename}
            </option>
          ))}
        </select>
      </label>
      <ErrorMessage error={assign.error} />
    </div>
  )
}

type DefenderProps = {
  glitch: Glitch
  guardian: Guardian
}

/** For defenders: take a free glitch, or release their own. */
export function TakeOrRelease({ glitch, guardian }: DefenderProps) {
  const t = useT()
  const router = useRouter()
  const isMine = glitch.assignedGuardianId === guardian.guardianId
  const change = useMutation({
    mutationFn: async () => {
      const data = { glitchId: glitch.glitchId }
      await (isMine ? releaseGlitch({ data }) : takeGlitch({ data }))
    },
    onSettled: () => router.invalidate(),
  })
  const isTakenByOther = glitch.assignedGuardianId !== null && !isMine

  return (
    <div className="flex flex-col items-start gap-3">
      {!isTakenByOther && (
        <button
          type="button"
          className="min-h-12 cursor-pointer rounded-xl border-2 border-edge bg-well px-5 font-bold hover:border-highlight disabled:opacity-50"
          disabled={change.isPending}
          onClick={() => change.mutate()}
        >
          {isMine ? t.glitches.release : t.glitches.assignToMe}
        </button>
      )}
      <ErrorMessage error={change.error} />
    </div>
  )
}

function ErrorMessage({ error }: { error: Error | null }) {
  const format = useFormat()
  if (!error) return null
  return (
    <p role="alert" className="text-magenta">
      {format.error(error)}
    </p>
  )
}
