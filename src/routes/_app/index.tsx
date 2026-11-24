import { Link, createFileRoute } from '@tanstack/react-router'
import { FileDown } from 'lucide-react'
import { useState } from 'react'
import { EchoList } from '#/components/echoes/EchoList.tsx'
import { ReportEchoDialog } from '#/components/echoes/ReportEchoDialog.tsx'
import { GlitchList } from '#/components/glitches/GlitchList.tsx'
import { HealthPanel } from '#/components/health/HealthPanel.tsx'
import { useT } from '#/i18n/index.ts'
import { getDashboard } from '#/lib/dashboard.functions.ts'
import { useShortcuts } from '#/lib/useShortcuts.ts'

export const Route = createFileRoute('/_app/')({
  loader: () => getDashboard(),
  component: MissionControl,
})

function MissionControl() {
  const { magic, glitches, echoes } = Route.useLoaderData()
  const { guardian } = Route.useRouteContext()
  const t = useT()
  const [isReporting, setIsReporting] = useState(false)
  useShortcuts({ r: () => setIsReporting(true) })

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
          title={t.glitches.assignedToYou}
          glitches={mine}
          emptyMessage={t.glitches.noneAssigned}
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
        title={t.glitches.title}
        glitches={glitches}
        emptyMessage={t.glitches.none}
        storageKey="glitches"
        isSearchable
        action={
          <Link
            to="/report"
            className="flex min-h-11 items-center gap-2 px-2 text-sm text-muted hover:text-highlight"
          >
            <FileDown size={18} aria-hidden="true" />
            <span className="clickable">{t.glitches.exportPdf}</span>
          </Link>
        }
      />
      {isReporting && <ReportEchoDialog onClose={() => setIsReporting(false)} />}
    </>
  )
}
