import { cn } from '@/lib/utils'

export function Table({ className, ...props }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ink-100">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  )
}

export function Thead({ className, ...props }) {
  return <thead className={cn('bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500', className)} {...props} />
}

export function Th({ className, ...props }) {
  return <th className={cn('px-4 py-3 font-semibold', className)} {...props} />
}

export function Tr({ className, ...props }) {
  return <tr className={cn('border-t border-ink-100 hover:bg-ink-50/60', className)} {...props} />
}

export function Td({ className, ...props }) {
  return <td className={cn('px-4 py-3 align-middle text-ink-800', className)} {...props} />
}
