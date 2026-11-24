import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { EchoList } from '#/components/echoes/EchoList.tsx'
import { ReportEchoDialog } from '#/components/echoes/ReportEchoDialog.tsx'
import { GlitchActions } from '#/components/glitches/GlitchActions.tsx'
import { AssignDefender, TakeOrRelease } from '#/components/glitches/GlitchAssignment.tsx'
import { GlitchStatusLabel } from '#/components/glitches/GlitchStatusLabel.tsx'
import { GuardianLink } from '#/components/guardians/GuardianLink.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import { canChangeStatus } from '#/lib/glitch.ts'
import { getGlitch } from '#/lib/glitches.functions.ts'
import { listGuardians } from '#/lib/guardians.functions.ts'
import { useShortcuts } from '#/lib/useShortcuts.ts'

export const Route = createFileRoute('/_app/glitches/$glitchId')({
  loader: async ({ params, context }) => {
    const isCommander = context.guardian.role === 'commander'
    const [glitch, guardians] = await Promise.all([
      getGlitch({ data: { glitchId: params.glitchId } }),
      isCommander ? listGuardians() : null,
    ])
    return { glitch, guardians }
  },
  component: GlitchPage,
  notFoundComponent: GlitchNotFound,
})

function GlitchNotFound() {
  const t = useT()
  return <p className="rounded-[18px] bg-panel p-6">{t.glitches.notFound}</p>
}

function GlitchPage() {
  const t = useT()
  const format = useFormat()
  const { glitch, guardians } = Route.useLoaderData()
  const { guardian } = Route.useRouteContext()
  const [isReporting, setIsReporting] = useState(false)
  useShortcuts({ r: () => setIsReporting(true) })

  return (
    <>
      <section className="flex flex-col gap-4 rounded-[18px] bg-panel p-4 md:p-6">
        <Link to="/" className="clickable self-start text-sm text-muted">
          {t.glitches.back}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[1.6rem] font-bold">{glitch.glitchId}</h2>
          {guardian.role === 'commander' && <GlitchActions glitch={glitch} />}
        </div>
        <p className="leading-snug break-words">{glitch.description}</p>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[.9rem] text-muted">
          <GlitchStatusLabel status={glitch.status} />
          {glitch.assignedGuardianId && glitch.assignedCodename ? (
            <GuardianLink guardianId={glitch.assignedGuardianId} codename={glitch.assignedCodename} />
          ) : (
            <span>{t.common.unassigned}</span>
          )}
          <time dateTime={glitch.timestamp}>{format.dateTime(glitch.timestamp)}</time>
        </p>
        {/* Keyed so an error on one glitch is not shown on the next. */}
        {guardians ? (
          <AssignDefender key={glitch.glitchId} glitch={glitch} guardians={guardians} />
        ) : (
          <TakeOrRelease key={glitch.glitchId} glitch={glitch} guardian={guardian} />
        )}
      </section>
      <EchoList
        echoes={glitch.echoes}
        storageKey="glitch-echoes"
        reportLabel={t.echoes.addUpdate}
        onReport={() => setIsReporting(true)}
      />
      {isReporting && (
        <ReportEchoDialog
          glitch={glitch}
          canChangeStatus={canChangeStatus(guardian, glitch)}
          onClose={() => setIsReporting(false)}
        />
      )}
    </>
  )
}
