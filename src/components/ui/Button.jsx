import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:outline-brand-700 shadow-sm',
  gold: 'bg-gold-500 text-white hover:bg-gold-600 shadow-sm',
  outline: 'border border-ink-200 bg-white text-ink-900 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-100',
  danger: 'bg-brick-500 text-white hover:bg-brick-600',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
}

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
}

const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', asChild, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  )
})

export default Button
