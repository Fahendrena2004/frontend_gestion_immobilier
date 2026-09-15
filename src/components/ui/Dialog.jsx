import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Dialog({ open, onClose, title, description, footer, children, className }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg',
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

        {title && (
          <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
        )}
        {description && (
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        )}

        <div className={cn(title || description ? 'mt-4' : '')}>{children}</div>

        {footer && (
          <div className="mt-6 flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  )
}
