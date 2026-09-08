import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input({ className, label, error, id, ...props }, ref) {
  const inputId = id || props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'h-10 w-full rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-900',
          'placeholder:text-ink-300 transition-colors',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error && 'border-brick-500 focus:border-brick-500 focus:ring-brick-50',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-brick-600">{error}</span>}
    </div>
  )
})

export default Input
