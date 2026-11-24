import { IMAGE_MAX_BYTES } from './message.ts'

const MAX_SIDE = 1600

/**
 * Shrinks a photo before upload. Redrawing it also drops hidden data such as the
 * location it was taken. GIFs are kept as they are, so they stay animated.
 */
export async function prepareImage(file: File): Promise<File> {
  const image = file.type === 'image/gif' ? file : await redraw(file)
  if (image.size > IMAGE_MAX_BYTES) throw new Error('Images can be up to 3 MB')
  return image
}

async function redraw(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('That file is not an image this browser can read')
  })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot prepare the image')
  // JPEG has no transparency, so see-through parts become white instead of black.
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.85),
  )
  if (!blob) throw new Error('This browser cannot prepare the image')
  return new File([blob], 'image.jpg', { type: 'image/jpeg' })
}
