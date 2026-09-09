import { cn } from '@/lib/utils'

const VARIANTS = {
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-500',
  danger: 'bg-brick-50 text-brick-600',
  brand: 'bg-brand-50 text-brand-600',
  neutral: 'bg-ink-100 text-ink-700',
}

export default function Badge({ variant = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
