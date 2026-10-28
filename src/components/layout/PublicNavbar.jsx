import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, LogIn, Menu, X, Building2 } from 'lucide-react'
import { useState, useEffect } from 'react'
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
  const location = useLocation()
  const navigate = useNavigate()

  function goToSection(target) {
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: target } })
      return
    }
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const [activeSection, setActiveSection] = useState('top')

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(null)
      return
    }

    const SECTION_IDS = ['nos-logements', 'comment-ca-marche', 'espace-proprietaire', 'faq']
    const REFERENCE_LINE = 120

    function calculerSection() {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        setActiveSection('faq')
        return
      }

      let active = 'top'
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= REFERENCE_LINE) {
          active = id
        }
      }
      setActiveSection(active)
    }

    let rafId = null
    function onScroll() {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        calculerSection()
        rafId = null
      })
    }

    calculerSection()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [location.pathname])

  const isActive = (target) => location.pathname === '/' && activeSection === target

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700">
              <Home className="h-4 w-4 text-gold-300" />
            </span>
            <span className="font-display text-lg font-bold text-ink-900">
              Toko<span className="text-gold-600">Fianar</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={() => goToSection('top')}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive('top') ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-brand-700 hover:bg-ink-50'
              )}
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => goToSection('nos-logements')}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive('nos-logements') ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-brand-700 hover:bg-ink-50'
              )}
            >
              Logements
            </button>
            <button
              type="button"
              onClick={() => goToSection('comment-ca-marche')}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive('comment-ca-marche') ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-brand-700 hover:bg-ink-50'
              )}
            >
              Comment ça marche
            </button>
            <button
              type="button"
              onClick={() => goToSection('espace-proprietaire')}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive('espace-proprietaire') ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-brand-700 hover:bg-ink-50'
              )}
            >
              Propriétaires
            </button>
            <button
              type="button"
              onClick={() => goToSection('faq')}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive('faq') ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-brand-700 hover:bg-ink-50'
              )}
            >
              FAQ
            </button>
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                {role === 'PROPRIETAIRE' && (
                  <Link to="/proprietaire/logements/nouveau">
                    <Button variant="primary" size="sm">
                      <Building2 className="h-4 w-4" /> Publier
                    </Button>
                  </Link>
                )}
                <DropdownMenu
                  align="right"
                  trigger={
                    <div className="flex items-center gap-2 rounded-full border border-ink-100 py-1 pl-1 pr-3 hover:bg-ink-50 transition-colors cursor-pointer">
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
              </>
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

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 transition-colors lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay — outside <header> to escape backdrop-blur containing block */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => goToSection('top')}
                className={cn(
                  'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                  isActive('top') ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                )}
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={() => goToSection('nos-logements')}
                className={cn(
                  'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                  isActive('nos-logements') ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                )}
              >
                Logements
              </button>
              <button
                type="button"
                onClick={() => goToSection('comment-ca-marche')}
                className={cn(
                  'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                  isActive('comment-ca-marche') ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                )}
              >
                Comment ça marche
              </button>
              <button
                type="button"
                onClick={() => goToSection('espace-proprietaire')}
                className={cn(
                  'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                  isActive('espace-proprietaire') ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                )}
              >
                Propriétaires
              </button>
              <button
                type="button"
                onClick={() => goToSection('faq')}
                className={cn(
                  'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                  isActive('faq') ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                )}
              >
                FAQ
              </button>
            </div>

            <div className="mt-6 border-t border-ink-100 pt-6">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-4">
                    <Avatar name={user?.nom} size="md" />
                    <div>
                      <p className="text-sm font-medium text-ink-900">{user?.nom}</p>
                      <p className="text-xs text-ink-500">{user?.email}</p>
                    </div>
                  </div>
                  {role === 'PROPRIETAIRE' && (
                    <Link to="/proprietaire/logements/nouveau" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full" size="md">
                        <Building2 className="h-4 w-4" /> Publier un logement
                      </Button>
                    </Link>
                  )}
                  <Link to={SPACE_BY_ROLE[role] || '/'} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="md">Mon espace</Button>
                  </Link>
                  <button onClick={logout} className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-brick-600 hover:bg-brick-50 transition-colors">
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/connexion" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="md">Connexion</Button>
                  </Link>
                  <Link to="/inscription" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="md">
                      <LogIn className="h-4 w-4" /> Créer un compte
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
