import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, CalendarCheck, KeyRound, Search,
  Building2, ClipboardList, Users, ShieldCheck, Wallet, BarChart3, Home as HomeIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOBILE_TABS_BY_ROLE = {
  LOCATAIRE: [
    { to: '/locataire', label: 'Accueil', icon: LayoutDashboard },
    { to: '/', label: 'Recherche', icon: Search },
    { to: '/locataire/demandes', label: 'Demandes', icon: FileText },
    { to: '/locataire/visites', label: 'Visites', icon: CalendarCheck },
    { to: '/locataire/location', label: 'Location', icon: KeyRound },
  ],
  PROPRIETAIRE: [
    { to: '/proprietaire', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/proprietaire/logements', label: 'Mes logements', icon: Building2 },
    { to: '/proprietaire/demandes', label: 'Demandes reçues', icon: ClipboardList },
    { to: '/proprietaire/visites', label: 'Visites', icon: CalendarCheck },
    { to: '/', label: 'Recherche', icon: Search },
  ],
  ADMINISTRATEUR: [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/comptes', label: 'Comptes', icon: Users },
    { to: '/admin/moderation', label: 'Modération', icon: ShieldCheck },
    { to: '/admin/paiements', label: 'Paiements', icon: Wallet },
    { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  ],
}

export default function MobileTabBar({ role }) {
  const tabs = MOBILE_TABS_BY_ROLE[role] || []

  if (tabs.length === 0) return null

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-brand-700'
                  : 'text-ink-500 hover:text-ink-700'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5', isActive ? 'fill-current' : '')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}