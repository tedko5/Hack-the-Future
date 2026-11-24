import { createFileRoute } from '@tanstack/react-router'
import { EchoList } from '#/components/echoes/EchoList.tsx'
import { HealthPanel } from '#/components/health/HealthPanel.tsx'
import { AppHeader } from '#/components/layout/AppHeader.tsx'
import { getDashboard } from '#/lib/dashboard.functions.ts'

export const Route = createFileRoute('/')({
  loader: () => getDashboard(),
  component: MissionControl,
})

function MissionControl() {
  const { guardian, magic, echoes } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <AppHeader guardian={guardian} />
      <HealthPanel magic={magic} />
      {/* TODO: open the report-echo form once it exists */}
      <EchoList echoes={echoes} />
    </div>
  )
}
