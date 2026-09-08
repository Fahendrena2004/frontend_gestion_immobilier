import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const Select = forwardRef(function Select({ className, label, error, id, children, ...props }, ref) {
  const inputId = id || props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          ref={ref}
          className={cn(
            'h-10 w-full appearance-none rounded-md border border-ink-200 bg-white px-3 pr-9 text-sm text-ink-900',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
            error && 'border-brick-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
      </div>
      {error && <span className="text-xs text-brick-600">{error}</span>}
    </div>
  )
})

export default Select
