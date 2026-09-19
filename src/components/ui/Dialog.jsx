import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Modale contrôlée : `open` pilote l'affichage, `onClose` est appelé sur
 * Échap, clic sur le fond et bouton de fermeture.
 *
 * Deux usages possibles :
 *   <Dialog open onClose title description footer={…}>…</Dialog>
 *   <Dialog open onClose><DialogContent>…</DialogContent><DialogFooter>…</DialogFooter></Dialog>
 */
export default function Dialog({ open, onClose, title, description, footer, children, className }) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)

    // Empêche le défilement de la page derrière la modale.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn(
          'relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-lg',
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 text-ink-400 hover:text-ink-700"
        >
          <X className="h-4 w-4" />
        </button>

        {title && <h2 className="pr-8 font-display text-lg font-semibold text-ink-900">{title}</h2>}
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}

        <div className={cn(title || description ? 'mt-4' : '')}>{children}</div>

        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export function DialogContent({ className, children }) {
  return <div className={cn('flex flex-col gap-4', className)}>{children}</div>
}

export function DialogFooter({ className, children }) {
  return <div className={cn('mt-6 flex flex-wrap justify-end gap-2', className)}>{children}</div>
}

export { Dialog }
