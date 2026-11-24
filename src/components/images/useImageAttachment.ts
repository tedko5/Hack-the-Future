import { useMutation } from '@tanstack/react-query'
import { useState, type ClipboardEvent } from 'react'
import { prepareImage } from '#/lib/utils/prepareImage.ts'

/** One image to send along with a form, picked or pasted. */
export function useImageAttachment() {
  const [image, setImage] = useState<File | null>(null)
  const prepare = useMutation({ mutationFn: prepareImage, onSuccess: setImage })

  function pasteImage(event: ClipboardEvent) {
    const { files } = event.clipboardData
    const file = [...files].find(({ type }) => type.startsWith('image/'))
    // Office apps add a picture of the text they copy; then the text is what is meant.
    if (!file || event.clipboardData.getData('text/plain')) return
    event.preventDefault()
    if (!prepare.isPending) prepare.mutate(file)
  }

  return {
    image,
    pickImage: (file: File) => prepare.mutate(file),
    pasteImage,
    removeImage: () => setImage(null),
    isPreparing: prepare.isPending,
    error: prepare.error,
  }
}
