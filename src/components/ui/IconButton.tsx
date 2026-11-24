import type { ComponentProps } from 'react'

export function IconButton({
  className = '',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center text-muted transition-colors hover:text-fg ${className}`}
      {...props}
    />
  )
}
