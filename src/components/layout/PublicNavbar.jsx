import { Link, NavLink } from 'react-router-dom'
import { Home, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import DropdownMenu from '@/components/ui/DropdownMenu'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const SPACE_BY_ROLE = {
  LOCATAIRE: '/locataire',
  PROPRIETAIRE: '/proprietaire',
  ADMINISTRATEUR: '/admin',
}

export default function PublicNavbar() {
  const { isAuthenticated, user, role, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-700">
            <Home className="h-4 w-4 text-gold-300" />
          </span>
          <span className="font-display text-lg font-bold text-ink-900">
            Toko<span className="text-gold-600">Fianar</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={({ isActive }) => cn('text-sm font-medium text-ink-600 hover:text-brand-700', isActive && 'text-brand-700')}>
            Rechercher un logement
          </NavLink>
          <a href="#comment-ca-marche" className="text-sm font-medium text-ink-600 hover:text-brand-700">
            Comment ça marche
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <DropdownMenu
              align="right"
              trigger={
                <div className="flex items-center gap-2 rounded-full border border-ink-100 py-1 pl-1 pr-3 hover:bg-ink-50">
                  <Avatar name={user?.nom} size="sm" />
                  <span className="text-sm font-medium text-ink-800">{user?.nom?.split(' ')[0]}</span>
                </div>
              }
              items={[
                { label: 'Mon espace', onClick: () => (window.location.href = SPACE_BY_ROLE[role] || '/') },
                { divider: true },
                { label: 'Déconnexion', danger: true, onClick: logout },
              ]}
            />
          ) : (
            <>
              <Link to="/connexion">
                <Button variant="ghost" size="md">Connexion</Button>
              </Link>
              <Link to="/inscription">
                <Button variant="primary" size="md">
                  <LogIn className="h-4 w-4" /> Créer un compte
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
          {mobileOpen ? <X className="h-6 w-6 text-ink-800" /> : <Menu className="h-6 w-6 text-ink-800" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-ink-700">
              Rechercher un logement
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={SPACE_BY_ROLE[role] || '/'} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-ink-700">
                  Mon espace
                </Link>
                <button onClick={logout} className="text-left text-sm font-medium text-brick-600">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-ink-700">Connexion</Link>
                <Link to="/inscription" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Créer un compte</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
