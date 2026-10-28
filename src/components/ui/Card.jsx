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

// Disposition souple : le titre et une éventuelle action (badge, bouton) se
// placent sur la même ligne, la description passe toute seule à la ligne.
export function CardHeader({ className, children }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-x-3 gap-y-1 border-b border-ink-100 px-5 py-4',
        className
      )}
    >
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

export function CardDescription({ className, children }) {
  return <p className={cn('w-full text-sm text-ink-500', className)}>{children}</p>
}

export function CardContent({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('flex items-center gap-2 border-t border-ink-100 px-5 py-4', className)}>
      {children}
    </div>
  )
}

export default Card
