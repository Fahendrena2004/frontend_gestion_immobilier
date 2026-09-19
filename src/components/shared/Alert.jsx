import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  error: {
    icon: AlertCircle,
    className: 'border-brick-300 bg-brick-50 text-brick-600',
    role: 'alert',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-300 bg-emerald-50 text-emerald-600',
    role: 'status',
  },
  info: {
    icon: Info,
    className: 'border-ink-200 bg-ink-50 text-ink-700',
    role: 'status',
  },
}

/**
 * Bandeau de retour utilisateur (erreur d'API, confirmation d'action).
 * `children` permet d'ajouter une action, par exemple un bouton « Réessayer ».
 */
export default function Alert({ variant = 'error', title, message, className, children }) {
  const { icon: Icon, className: variantClass, role } = VARIANTS[variant] ?? VARIANTS.error

  if (!message && !title && !children) return null

  return (
    <div
      role={role}
      className={cn('flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm', variantClass, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {message && <p className={cn(title && 'mt-0.5')}>{message}</p>}
        {children}
      </div>
    </div>
  )
}
