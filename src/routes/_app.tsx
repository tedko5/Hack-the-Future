import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '#/components/layout/AppHeader.tsx'
import { getCurrentGuardian } from '#/lib/guardians.functions.ts'

// Everything under _app needs a signed-in guardian.
export const Route = createFileRoute('/_app')({
  beforeLoad: async () => ({ guardian: await getCurrentGuardian() }),
  component: AppLayout,
})

function AppLayout() {
  const { guardian } = Route.useRouteContext()

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 pt-7 pb-20 md:gap-8 md:pt-11">
      <AppHeader guardian={guardian} />
      <Outlet />
    </main>
  )
}
