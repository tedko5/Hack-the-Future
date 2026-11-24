import type { ImageType } from '#/lib/message.ts'

/** Reads the type from the content itself, because the one a client sends cannot be trusted. */
export function detectImageType(data: Buffer): ImageType | undefined {
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg'
  if (data.subarray(0, 8).equals(Buffer.from('\x89PNG\r\n\x1a\n', 'latin1'))) return 'image/png'
  const start = data.toString('latin1', 0, 12)
  if (start.startsWith('GIF87a') || start.startsWith('GIF89a')) return 'image/gif'
  if (start.startsWith('RIFF') && start.endsWith('WEBP')) return 'image/webp'
  return undefined
}
