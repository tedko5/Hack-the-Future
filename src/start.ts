import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createCsrfMiddleware, createStart } from '@tanstack/react-start'
import { hideDatabaseErrors } from '#/middleware/errors.ts'

// A custom start file drops TanStack Start's default CSRF check, so add it back.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

/** Comma-separated origins that may use a session, e.g. https://app.example.com */
function authorizedParties() {
  const origins = (process.env.CLERK_AUTHORIZED_PARTIES ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
  return origins.length > 0 ? origins : undefined
}

export const startInstance = createStart(() => ({
  functionMiddleware: [hideDatabaseErrors],
  requestMiddleware: [
    csrfMiddleware,
    clerkMiddleware(() => ({
      authorizedParties: authorizedParties(),
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    })),
  ],
}))
