import { createMiddleware } from '@tanstack/react-start'

/** Room for one image of IMAGE_MAX_BYTES plus the rest of the form. */
const MAX_BODY_BYTES = 4 * 1024 * 1024

/** Refuses oversized requests before they are read into memory. */
export const limitBodySize = createMiddleware().server(({ request, next }) => {
  if (request.method === 'POST') {
    const length = Number(request.headers.get('Content-Length') ?? NaN)
    // No length means a streamed body, which browsers do not send for our forms.
    if (!(length <= MAX_BODY_BYTES)) throw new Response('Request too large', { status: 413 })
  }
  return next()
})
