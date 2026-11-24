import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router'
import { OracleChat } from '#/components/chat/OracleChat.tsx'
import { AppHeader } from '#/components/layout/AppHeader.tsx'
import { getCurrentGuardian } from '#/lib/guardians.functions.ts'
import { useLiveEvents } from '#/lib/useLiveEvents.ts'

// Everything under _app needs a signed-in guardian.
export const Route = createFileRoute('/_app')({
  beforeLoad: async () => ({ guardian: await getCurrentGuardian() }),
  component: AppLayout,
})

function AppLayout() {
  const { guardian } = Route.useRouteContext()
  const router = useRouter()
  // Keeps every page under _app live.
  useLiveEvents(() => router.invalidate())

  return (
    <>
      <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 pt-7 pb-20 md:gap-8 md:pt-11">
        <AppHeader guardian={guardian} />
        <Outlet />
      </main>
      <OracleChat />
    </>
  )
}
