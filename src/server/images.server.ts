import { auth } from '@clerk/tanstack-react-start/server'
import type { ImageType } from '#/lib/image.ts'
import { findGuardian } from '#/server/guardians.server.ts'

export type StoredImage = { type: ImageType; data: Buffer }

/** Throws unless the upload really is an image. */
export async function readImage(file: File): Promise<StoredImage> {
  const data = Buffer.from(await file.arrayBuffer())
  const type = detectImageType(data)
  if (!type) throw new Error('Use a JPEG, PNG, WebP or GIF image')
  return { type, data }
}

/** Reads the type from the content itself, because the one a client sends cannot be trusted. */
function detectImageType(data: Buffer): ImageType | undefined {
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg'
  if (data.subarray(0, 8).equals(Buffer.from('\x89PNG\r\n\x1a\n', 'latin1'))) return 'image/png'
  const start = data.toString('latin1', 0, 12)
  if (start.startsWith('GIF87a') || start.startsWith('GIF89a')) return 'image/gif'
  if (start.startsWith('RIFF') && start.endsWith('WEBP')) return 'image/webp'
  return undefined
}

/** Answers a request for an image, if `find` lets this guardian see it. */
export async function serveImage(
  id: string,
  find: (guardianId: string, id: number) => Promise<StoredImage | undefined>,
) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated || !userId) return new Response('Unauthorized', { status: 401 })
  if (!/^[1-9]\d{0,8}$/.test(id)) return new Response('Not found', { status: 404 })
  try {
    const guardian = await findGuardian(userId)
    if (!guardian) return new Response('Forbidden', { status: 403 })
    const image = await find(guardian.guardianId, Number(id))
    if (!image) return new Response('Not found', { status: 404 })

    return new Response(new Uint8Array(image.data), {
      headers: {
        'Content-Type': image.type,
        'Cache-Control': 'private, max-age=3600',
        // Never let the browser treat an upload as anything but an image.
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    })
  } catch (error) {
    console.error(error)
    return new Response('Unavailable', { status: 503 })
  }
}
