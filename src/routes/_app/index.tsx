import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { EchoList } from '#/components/echoes/EchoList.tsx'
import { ReportEchoDialog } from '#/components/echoes/ReportEchoDialog.tsx'
import { GlitchList } from '#/components/glitches/GlitchList.tsx'
import { HealthPanel } from '#/components/health/HealthPanel.tsx'
import { getDashboard } from '#/lib/dashboard.functions.ts'

export const Route = createFileRoute('/_app/')({
  loader: () => getDashboard(),
  component: MissionControl,
})

function MissionControl() {
  const { magic, glitches, echoes } = Route.useLoaderData()
  const { guardian } = Route.useRouteContext()
  const [isReporting, setIsReporting] = useState(false)

  const mine = glitches.filter(
    (glitch) => glitch.assignedGuardianId === guardian.guardianId && glitch.status !== 'FIXED',
  )
  // Glitches are assigned to defenders, so a commander only has some left from before a promotion.
  const showMine = guardian.role === 'defender' || mine.length > 0

  return (
    <>
      <HealthPanel magic={magic} />
      {showMine && (
        <GlitchList
          title="Assigned to you"
          glitches={mine}
          emptyMessage="Nothing assigned to you right now."
          storageKey="assigned"
        />
      )}
      <EchoList
        echoes={echoes}
        storageKey="echoes"
        onReport={() => setIsReporting(true)}
        canFilterToday
      />
      <GlitchList
        title="Glitches"
        glitches={glitches}
        emptyMessage="No glitches. Magic is safe."
        storageKey="glitches"
        isSearchable
      />
      {isReporting && <ReportEchoDialog onClose={() => setIsReporting(false)} />}
    </>
  )
}
