import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export function Card({ className, elevated, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)]',
        elevated ? 'bg-[var(--surface-2)]' : 'bg-[var(--surface)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
