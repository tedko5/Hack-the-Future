import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { EchoList } from '#/components/echoes/EchoList.tsx'
import { ReportEchoDialog } from '#/components/echoes/ReportEchoDialog.tsx'
import { HealthPanel } from '#/components/health/HealthPanel.tsx'
import { getDashboard } from '#/lib/dashboard.functions.ts'
import { useLiveEvents } from '#/lib/useLiveEvents.ts'

export const Route = createFileRoute('/_app/')({
  loader: () => getDashboard(),
  component: MissionControl,
})

function MissionControl() {
  const { magic, echoes } = Route.useLoaderData()
  const router = useRouter()
  const [isReporting, setIsReporting] = useState(false)
  useLiveEvents(() => router.invalidate())

  return (
    <>
      <HealthPanel magic={magic} />
      <EchoList echoes={echoes} onReport={() => setIsReporting(true)} />
      {isReporting && <ReportEchoDialog onClose={() => setIsReporting(false)} />}
    </>
  )
}
