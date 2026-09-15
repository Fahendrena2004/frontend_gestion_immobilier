import { Outlet, Link } from 'react-router-dom'
import PublicNavbar from './PublicNavbar'
import MobileTabBar from './MobileTabBar'
import { useAuth } from '@/context/AuthContext'

export default function PublicLayout() {
  const { role, isAuthenticated } = useAuth()
  const isAuthenticatedUser = isAuthenticated && role

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <span className="font-display text-lg font-bold text-ink-900">
                Toko<span className="text-gold-600">Fianar</span>
              </span>
              <p className="mt-2 max-w-xs text-sm text-ink-500">
                La plateforme centralisée de recherche et de gestion de location de logements à Fianarantsoa.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="flex flex-col gap-2">
                <span className="font-medium text-ink-900">Locataires</span>
                <Link to="/" className="text-ink-500 hover:text-brand-700">Rechercher</Link>
                <Link to="/inscription" className="text-ink-500 hover:text-brand-700">Créer un compte</Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-ink-900">Propriétaires</span>
                <Link to="/inscription" className="text-ink-500 hover:text-brand-700">Publier un logement</Link>
                <Link to="/connexion" className="text-ink-500 hover:text-brand-700">Se connecter</Link>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-ink-100 pt-6 text-xs text-ink-300">
            © {new Date().getFullYear()} TokoFianar — Projet académique de conception et développement.
          </p>
        </div>
      </footer>
      {isAuthenticatedUser && <MobileTabBar role={role} />}
    </div>
  )
}
