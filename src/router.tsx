import { QueryClient } from '@tanstack/react-query'
import { createRouter, type ParsedLocation } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { PageError, PageNotFound } from '#/components/ui/PageMessage.tsx'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: onlyAfterNavigating(),
    defaultErrorComponent: PageError,
    defaultNotFoundComponent: PageNotFound,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })
  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}

/**
 * Live updates refresh the page that is open. Restoring its scroll positions then would undo
 * scrolling that happened meanwhile, such as a chat moving to its newest message.
 */
function onlyAfterNavigating() {
  let lastKey: string | undefined
  return ({ location }: { location: ParsedLocation }) => {
    const key = location.state.__TSR_key ?? location.href
    const isNew = key !== lastKey
    lastKey = key
    return isNew
  }
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
