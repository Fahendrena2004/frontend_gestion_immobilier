import { Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, CalendarCheck, KeyRound,
  Users, ShieldCheck, BarChart3, Wallet, Building2, ClipboardList,
  LogOut, User,
} from 'lucide-react'
import Sidebar from './Sidebar'
import MobileTabBar from './MobileTabBar'
import NotificationBell from '@/components/shared/NotificationBell'
import DropdownMenu from '@/components/ui/DropdownMenu'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

const NAV_BY_ROLE = {
  LOCATAIRE: [
    { to: '/locataire', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/locataire/demandes', label: 'Mes demandes', icon: FileText },
    { to: '/locataire/visites', label: 'Mes visites', icon: CalendarCheck },
    { to: '/locataire/location', label: 'Ma location', icon: KeyRound },
    { to: '/locataire/profil', label: 'Profil', icon: User },
  ],
  PROPRIETAIRE: [
    { to: '/proprietaire', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/proprietaire/logements', label: 'Mes logements', icon: Building2 },
    { to: '/proprietaire/demandes', label: 'Demandes reçues', icon: ClipboardList },
    { to: '/proprietaire/visites', label: 'Visites', icon: CalendarCheck },
    { to: '/proprietaire/profil', label: 'Profil', icon: User },
  ],
  ADMINISTRATEUR: [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/admin/moderation', label: 'Modération des annonces', icon: ShieldCheck },
    { to: '/admin/comptes', label: 'Gestion des comptes', icon: Users },
    { to: '/admin/paiements', label: 'Vérification des paiements', icon: Wallet },
    { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
    { to: '/admin/profil', label: 'Profil', icon: User },
  ],
}

const ROLE_LABEL = {
  LOCATAIRE: 'Espace locataire',
  PROPRIETAIRE: 'Espace propriétaire',
  ADMINISTRATEUR: 'Espace administrateur',
}

// Le segment d'URL ne correspond pas toujours au rôle (ADMINISTRATEUR -> /admin).
const PROFIL_PATH = {
  LOCATAIRE: '/locataire/profil',
  PROPRIETAIRE: '/proprietaire/profil',
  ADMINISTRATEUR: '/admin/profil',
}

export default function DashboardLayout() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV_BY_ROLE[role] || []

  async function handleLogout() {
    await logout()
    navigate('/connexion', { replace: true })
  }

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
            {/* Visible logout button on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={handleLogout}
              aria-label="Déconnexion"
            >
              <LogOut className="h-5 w-5 text-ink-600 hover:text-brick-600" />
            </Button>
            {/* Dropdown menu for desktop */}
            <div className="hidden lg:block">
              <DropdownMenu
                trigger={<Avatar name={user?.nom} size="sm" />}
                items={[
                  { label: 'Mon profil', onClick: () => navigate(`${PROFIL_PATH[role] ?? '/'}`) },
                  { divider: true },
                  { label: 'Déconnexion', danger: true, onClick: handleLogout },
                ]}
              />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:pb-0 pb-20">
          <Outlet />
        </main>
        <MobileTabBar role={role} />
      </div>
    </div>
  )
}
