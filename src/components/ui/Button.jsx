import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100',
  outline: 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
  danger: 'bg-brick-500 text-white hover:bg-brick-600',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-10 w-10 p-0',
}

const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-brand-100',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

export { Button }
export default Button
