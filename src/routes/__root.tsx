import { ClerkProvider } from '@clerk/tanstack-react-start'
// Bundled rather than loaded from Clerk's CDN, so our CSS overrides keep matching its DOM.
import { ui } from '@clerk/ui'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { RiftBackground } from '#/components/layout/RiftBackground.tsx'
import { clerkLocalizations } from '#/i18n/clerk.ts'
import { getLanguage } from '#/i18n/currentLanguage.ts'
import { clerkAppearance } from '#/lib/ui/clerk-appearance.ts'
import { THEME_INIT_SCRIPT, useThemeVersion } from '#/lib/ui/theme.ts'

import type { QueryClient } from '@tanstack/react-query'
import { useMemo, type ReactNode } from 'react'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: () => ({ language: getLanguage() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Achrona Mission Control' },
      // Tints the browser bar on phones in the dark theme's night colour.
      { name: 'theme-color', content: '#15172a' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      // iPhones want a PNG for the home screen.
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
    // Applies a saved light theme before the page paints.
    scripts: [{ children: THEME_INIT_SCRIPT }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  return (
    // Clip rather than hidden: that would keep the tab bar from sticking.
    <div className="relative min-h-screen overflow-x-clip">
      <div className="print:hidden">
        <RiftBackground />
      </div>
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const { language } = Route.useRouteContext()
  // A new object per theme change makes Clerk re-read the theme's colour variables.
  const themeVersion = useThemeVersion()
  const appearance = useMemo(() => ({ ...clerkAppearance }), [themeVersion])

  return (
    // The init script may set data-theme before React hydrates.
    <html lang={language} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-app font-sans antialiased">
        <ClerkProvider
          ui={ui}
          appearance={appearance}
          localization={clerkLocalizations[language]}
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
