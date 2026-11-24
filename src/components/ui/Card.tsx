import type { ReactNode } from 'react'

type CardProps = {
  className?: string
  children: ReactNode
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-line bg-gradient-to-b from-card to-panel ${className}`}
    >
      {children}
    </div>
  )
}
