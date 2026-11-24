import { useState } from 'react'

type Props = {
  codename: string
  imageUrl: string | null
}

/** Decorative: the codename is always next to it. Falls back to the first letter. */
export function Avatar({ codename, imageUrl }: Props) {
  // The URL that failed, so a new picture gets a new chance.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (!imageUrl || imageUrl === failedUrl) {
    return (
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bubble text-sm font-bold text-fg"
      >
        {codename.charAt(0).toUpperCase()}
      </span>
    )
  }
  return (
    <img
      // Catches a picture that failed before the page became interactive.
      ref={(image) => {
        if (image?.complete && image.naturalWidth === 0) setFailedUrl(imageUrl)
      }}
      src={imageUrl}
      alt=""
      width={32}
      height={32}
      referrerPolicy="no-referrer"
      className="size-8 shrink-0 rounded-full object-cover"
      onError={() => setFailedUrl(imageUrl)}
    />
  )
}
