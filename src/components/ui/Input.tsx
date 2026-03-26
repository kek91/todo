import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-[#7B80A0] font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3',
            'text-[var(--text)] placeholder:text-[var(--muted)]',
            'outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
            'transition-all text-base min-h-[48px]',
            error && 'border-[#F55A5A] focus:border-[#F55A5A] focus:ring-[#F55A5A]/20',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#F55A5A]">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
