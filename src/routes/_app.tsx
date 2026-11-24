import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { OracleChat } from '#/components/chat/OracleChat.tsx'
import { AppFooter } from '#/components/layout/AppFooter.tsx'
import { AppHeader } from '#/components/layout/AppHeader.tsx'
import { KeyboardShortcuts } from '#/components/layout/KeyboardShortcuts.tsx'
import { NavTabs } from '#/components/layout/NavTabs.tsx'
import { getCurrentGuardian } from '#/lib/guardians.functions.ts'
import { NotificationToast } from '#/components/notifications/NotificationToast.tsx'
import { getInbox } from '#/lib/notifications.functions.ts'
import { useLiveEvents } from '#/lib/useLiveEvents.ts'

// Everything under _app needs a signed-in guardian.
export const Route = createFileRoute('/_app')({
  beforeLoad: async () => ({ guardian: await getCurrentGuardian() }),
  loader: () => getInbox(),
  component: AppLayout,
})

function AppLayout() {
  const { guardian } = Route.useRouteContext()
  const inbox = Route.useLoaderData()
  const router = useRouter()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  // Keeps every page under _app live.
  useLiveEvents(() => router.invalidate())

  return (
    <>
      <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 pt-7 pb-38 md:gap-8 md:pt-11 md:pb-20 print:max-w-none print:p-0">
        <AppHeader guardian={guardian} />
        <NavTabs
          guardian={guardian}
          unreadMessages={inbox.unreadMessages}
          unreadNotifications={inbox.unreadNotifications}
        />
        <Outlet />
        <AppFooter onShowShortcuts={() => setIsHelpOpen(true)} />
      </main>
      <KeyboardShortcuts isHelpOpen={isHelpOpen} onHelpChange={setIsHelpOpen} />
      <div className="print:hidden">
        <NotificationToast latest={inbox.latestNotification} />
        <OracleChat />
      </div>
    </>
  )
}
