import { createMiddleware } from '@tanstack/react-start'
import { DrizzleQueryError } from 'drizzle-orm'

/** Database errors contain the SQL and its values: log them, never send them to the browser. */
export const hideDatabaseErrors = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    try {
      return await next()
    } catch (error) {
      if (!(error instanceof DrizzleQueryError)) throw error
      console.error(error)
      throw new Error('Something went wrong, please try again')
    }
  },
)
