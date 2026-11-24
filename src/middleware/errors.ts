import { createMiddleware } from '@tanstack/react-start'
import { DrizzleQueryError } from 'drizzle-orm'
import { getLanguage } from '#/i18n/currentLanguage.ts'
import { translateError } from '#/i18n/errors.ts'

/**
 * Sends errors in the language of the request. Database errors contain the SQL and its
 * values: they are logged, and never sent to the browser.
 */
export const presentErrors = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    // Redirects and not-found are thrown too, but are not errors.
    if (!(error instanceof Error)) throw error
    const isDatabaseError = error instanceof DrizzleQueryError
    if (isDatabaseError) console.error(error)
    const message = isDatabaseError ? 'Something went wrong, please try again' : error.message
    const translated = translateError(message, getLanguage())
    throw translated === error.message ? error : new Error(translated)
  }
})
