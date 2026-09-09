import { cn } from '@/lib/utils'

export function Table({ className, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ink-100 bg-white">
      <table className={cn('w-full text-left text-sm', className)}>{children}</table>
    </div>
  )
}

export function Thead({ className, children }) {
  return (
    <thead className={cn('border-b border-ink-100 bg-ink-50 text-xs uppercase text-ink-500', className)}>
      {children}
    </thead>
  )
}

export function Th({ className, children }) {
  return <th className={cn('px-4 py-3 font-medium', className)}>{children}</th>
}

export function Tr({ className, children }) {
  return <tr className={cn('border-b border-ink-100 last:border-0 hover:bg-ink-50/60', className)}>{children}</tr>
}

export function Td({ className, children }) {
  return <td className={cn('px-4 py-3 text-ink-700', className)}>{children}</td>
}
