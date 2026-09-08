import { Outlet } from 'react-router-dom'
import {
  LayoutDashboard, FileText, CalendarCheck, Home as HomeIcon, KeyRound,
  Users, ShieldCheck, BarChart3, Wallet, Building2, ClipboardList,
} from 'lucide-react'
import Sidebar from './Sidebar'
import NotificationBell from '@/components/shared/NotificationBell'
import DropdownMenu from '@/components/ui/DropdownMenu'
import Avatar from '@/components/ui/Avatar'
import { useAuth } from '@/context/AuthContext'

const NAV_BY_ROLE = {
  LOCATAIRE: [
    { to: '/locataire', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/locataire/demandes', label: 'Mes demandes', icon: FileText },
    { to: '/locataire/visites', label: 'Mes visites', icon: CalendarCheck },
    { to: '/locataire/location', label: 'Ma location', icon: KeyRound },
  ],
  PROPRIETAIRE: [
    { to: '/proprietaire', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/proprietaire/logements', label: 'Mes logements', icon: Building2 },
    { to: '/proprietaire/demandes', label: 'Demandes reçues', icon: ClipboardList },
    { to: '/proprietaire/visites', label: 'Visites', icon: CalendarCheck },
  ],
  ADMINISTRATEUR: [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/admin/moderation', label: 'Modération des annonces', icon: ShieldCheck },
    { to: '/admin/comptes', label: 'Gestion des comptes', icon: Users },
    { to: '/admin/paiements', label: 'Vérification des paiements', icon: Wallet },
    { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  ],
}

const ROLE_LABEL = {
  LOCATAIRE: 'Espace locataire',
  PROPRIETAIRE: 'Espace propriétaire',
  ADMINISTRATEUR: 'Espace administrateur',
}

export default function DashboardLayout() {
  const { user, role, logout } = useAuth()
  const items = NAV_BY_ROLE[role] || []

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar items={items} roleLabel={ROLE_LABEL[role]} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6">
          <p className="font-display text-sm font-semibold text-ink-500 lg:hidden">
            Toko<span className="text-gold-600">Fianar</span>
          </p>
          <div className="hidden text-sm text-ink-500 lg:block">
            Bonjour, <span className="font-medium text-ink-900">{user?.nom?.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <DropdownMenu
              trigger={<Avatar name={user?.nom} size="sm" />}
              items={[
                { label: 'Mon profil', onClick: () => {} },
                { divider: true },
                { label: 'Déconnexion', danger: true, onClick: logout },
              ]}
            />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
