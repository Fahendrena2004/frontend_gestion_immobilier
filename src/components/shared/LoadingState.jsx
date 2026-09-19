import { cn } from '@/lib/utils'

/** Indicateur de chargement circulaire. */
export function Spinner({ className }) {
  return (
    <span
      role="status"
      aria-label="Chargement en cours"
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600',
        className
      )}
    />
  )
}

/** Bloc de chargement centré, pour remplacer le contenu d'une page ou d'une carte. */
export default function LoadingState({ label = 'Chargement…', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-14 text-sm text-ink-500', className)}>
      <Spinner className="h-8 w-8 border-4" />
      <p>{label}</p>
    </div>
  )
}
