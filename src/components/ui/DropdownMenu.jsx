import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Menu déroulant léger sans dépendance externe. */
export default function DropdownMenu({ trigger, items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 mt-2 w-52 overflow-hidden rounded-md border border-ink-100 bg-white py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1 h-px bg-ink-100" />
            ) : (
              <button
                key={i}
                role="menuitem"
                onClick={() => { item.onClick?.(); setOpen(false) }}
                className={cn(
                  'flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-ink-700 hover:bg-ink-50',
                  item.danger && 'text-brick-600 hover:bg-brick-50'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
