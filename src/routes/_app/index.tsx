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
  const [isReporting, setIsReporting] = useState(false)

  return (
    <>
      <HealthPanel magic={magic} />
      <GlitchList glitches={glitches} />
      <EchoList echoes={echoes} onReport={() => setIsReporting(true)} />
      {isReporting && <ReportEchoDialog onClose={() => setIsReporting(false)} />}
    </>
  )
}
