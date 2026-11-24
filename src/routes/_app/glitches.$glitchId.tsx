import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { EchoList } from '#/components/echoes/EchoList.tsx'
import { ReportEchoDialog } from '#/components/echoes/ReportEchoDialog.tsx'
import { GlitchControls } from '#/components/glitches/GlitchControls.tsx'
import { GlitchStatusLabel } from '#/components/glitches/GlitchStatusLabel.tsx'
import { formatDateTime } from '#/lib/formatDate.ts'
import { getGlitch } from '#/lib/glitches.functions.ts'
import { listGuardians } from '#/lib/guardians.functions.ts'

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
  notFoundComponent: () => <p className="rounded-[18px] bg-panel p-6">That glitch does not exist.</p>,
})

function GlitchPage() {
  const { glitch, guardians } = Route.useLoaderData()
  const [isReporting, setIsReporting] = useState(false)

  return (
    <>
      <section className="flex flex-col gap-4 rounded-[18px] bg-panel p-4 md:p-6">
        <Link to="/" className="self-start text-sm text-muted hover:text-cyan">
          Back to mission control
        </Link>
        <h2 className="font-display text-[1.6rem] font-bold">{glitch.glitchId}</h2>
        <p className="leading-snug break-words">{glitch.description}</p>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[.9rem] text-muted">
          <GlitchStatusLabel status={glitch.status} />
          <span>{glitch.assignedCodename ?? 'Unassigned'}</span>
          <time dateTime={glitch.timestamp}>{formatDateTime(glitch.timestamp)}</time>
        </p>
        {/* Keyed so an error on one glitch is not shown on the next. */}
        {guardians && <GlitchControls key={glitch.glitchId} glitch={glitch} guardians={guardians} />}
      </section>
      <EchoList echoes={glitch.echoes} reportLabel="Add update" onReport={() => setIsReporting(true)} />
      {isReporting && (
        <ReportEchoDialog glitchId={glitch.glitchId} onClose={() => setIsReporting(false)} />
      )}
    </>
  )
}
