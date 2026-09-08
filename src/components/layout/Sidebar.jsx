import { NavLink, Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar({ items, roleLabel }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-brand-900 lg:flex">
      <Link to="/" className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-500">
          <Home className="h-4 w-4 text-brand-900" />
        </span>
        <span className="font-display text-lg font-bold text-white">
          Toko<span className="text-gold-400">Fianar</span>
        </span>
      </Link>
      <p className="px-6 pb-3 text-xs font-semibold uppercase tracking-wider text-brand-300">{roleLabel}</p>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-brand-100/80 transition-colors',
                'hover:bg-white/5 hover:text-white',
                isActive && 'bg-white/10 text-white'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-6 py-4">
        <Link to="/" className="text-xs font-medium text-brand-300 hover:text-white">
          ← Retour au site public
        </Link>
      </div>
    </aside>
  )
}
