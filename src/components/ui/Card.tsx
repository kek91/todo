import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export function Card({ className, elevated, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#2E3245]',
        elevated ? 'bg-[#252837]' : 'bg-[#1A1D27]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
