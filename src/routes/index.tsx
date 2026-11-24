import {createFileRoute} from '@tanstack/react-router'
import {GlitchesTable} from '#/components/GlitchesTable.tsx'
import {getGlitches} from '#/lib/glitches.functions.ts'

export const Route = createFileRoute('/')({
  loader: () => getGlitches(),
  component: OverviewPage,
})

function OverviewPage() {
  const glitches = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold text-fg">Overview</h1>
      <GlitchesTable glitches={glitches} />
    </div>
  )
}
