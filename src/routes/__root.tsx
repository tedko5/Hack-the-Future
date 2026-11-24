import { ClerkProvider } from '@clerk/tanstack-react-start'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { RiftBackground } from '#/components/layout/RiftBackground.tsx'
import { clerkAppearance } from '#/lib/clerk-appearance.ts'
import { THEME_INIT_SCRIPT, useThemeVersion } from '#/lib/theme.ts'

import type { QueryClient } from '@tanstack/react-query'
import { useMemo, type ReactNode } from 'react'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Achrona Mission Control' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    // Applies a saved light theme before the page paints.
    scripts: [{ children: THEME_INIT_SCRIPT }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <RiftBackground />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  // A new object per theme change makes Clerk re-read the theme's colour variables.
  const themeVersion = useThemeVersion()
  const appearance = useMemo(() => ({ ...clerkAppearance }), [themeVersion])

  return (
    // The init script may set data-theme before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-app font-sans antialiased">
        <ClerkProvider
          appearance={appearance}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          afterSignOutUrl="/sign-in"
        >
          {children}
        </ClerkProvider>
        <TanStackDevtools
          config={{ position: 'bottom-left' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
