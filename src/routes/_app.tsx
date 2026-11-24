import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '#/components/layout/Sidebar'
import { getCurrentGuardian } from '#/lib/guardians.functions.ts'

// Everything under _app needs a signed-in guardian.
export const Route = createFileRoute('/_app')({
  beforeLoad: async () => ({ guardian: await getCurrentGuardian() }),
  component: AppLayout,
})

function AppLayout() {
  const { guardian } = Route.useRouteContext()

  return (
    <div className="flex min-h-screen">
      <Sidebar guardian={guardian} />
      <main className="min-w-0 flex-1 px-16 py-10">
        <Outlet />
      </main>
    </div>
  )
}
