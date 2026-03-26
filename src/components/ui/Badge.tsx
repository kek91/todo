import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent'
  className?: string
}

const variants = {
  default: 'bg-[#2E3245] text-[var(--muted)]',
  success: 'bg-[#5EE8A8]/15 text-[#5EE8A8]',
  warning: 'bg-[#F5A623]/15 text-[#F5A623]',
  danger: 'bg-[#F55A5A]/15 text-[#F55A5A]',
  accent: 'bg-[#7C6AF5]/15 text-[#7C6AF5]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
