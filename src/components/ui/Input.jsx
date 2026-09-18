import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input({ className, label, error, id, type, ...props }, ref) {
  const inputId = id || props.name
  const isPassword = type === 'password'
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          className={cn(
            'h-10 w-full rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-900',
            'placeholder:text-ink-300 transition-colors',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
            error && 'border-brick-500 focus:border-brick-500 focus:ring-brick-50',
            isPassword && 'pr-10',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:text-ink-600 transition-colors"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-brick-600">{error}</span>}
    </div>
  )
})

export default Input
