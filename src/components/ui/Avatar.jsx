import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils'

export default function Avatar({ name, className, size = 'md' }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-700 font-semibold text-white',
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {initials(name) || '?'}
    </div>
  )
}
