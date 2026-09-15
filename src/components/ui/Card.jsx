import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-lg border border-ink-100 bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('border-b border-ink-100 px-5 py-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('font-display text-base font-semibold text-ink-900', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>
}
