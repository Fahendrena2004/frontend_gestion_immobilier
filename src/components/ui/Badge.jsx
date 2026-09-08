import { cn } from '@/lib/utils'

const VARIANTS = {
  neutral: 'bg-ink-100 text-ink-700',
  brand: 'bg-brand-50 text-brand-700',
  gold: 'bg-gold-50 text-gold-700',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-500',
  danger: 'bg-brick-50 text-brick-600',
}

export default function Badge({ className, variant = 'neutral', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
