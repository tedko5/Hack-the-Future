import { z } from 'zod'

/** SVG is left out on purpose: it can contain scripts. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

export type ImageType = (typeof IMAGE_TYPES)[number]

export const IMAGE_MAX_BYTES = 3 * 1024 * 1024

export const imageSchema = z
  .file('Invalid image')
  .max(IMAGE_MAX_BYTES, 'Images can be up to 3 MB')
