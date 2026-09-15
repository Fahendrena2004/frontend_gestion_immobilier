import { Outlet, Link } from 'react-router-dom'
import { Home, Mail, MapPin } from 'lucide-react'
import PublicNavbar from './PublicNavbar'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-100 bg-ink-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600">
                  <Home className="h-4 w-4 text-gold-300" />
                </span>
                <span className="font-display text-lg font-bold text-white">
                  Toko<span className="text-gold-400">Fianar</span>
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-ink-300">
                La plateforme centralisée de recherche et de gestion de location de logements à Fianarantsoa.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-ink-300">
                <MapPin className="h-4 w-4 shrink-0" /> Fianarantsoa, Madagascar
              </div>
            </div>

            {/* Locataires */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Locataires</h4>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-300">
                <li><Link to="/" className="hover:text-gold-400 transition-colors">Rechercher un logement</Link></li>
                <li><Link to="/inscription" className="hover:text-gold-400 transition-colors">Créer un compte</Link></li>
                <li><Link to="/connexion" className="hover:text-gold-400 transition-colors">Se connecter</Link></li>
              </ul>
            </div>

            {/* Propriétaires */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Propriétaires</h4>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-300">
                <li><Link to="/inscription" className="hover:text-gold-400 transition-colors">Publier un logement</Link></li>
                <li><Link to="/connexion" className="hover:text-gold-400 transition-colors">Se connecter</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Contact</h4>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-300">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" /> contact@tokofianar.mg
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" /> Fianarantsoa, Madagascar
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-ink-700 pt-6 text-xs text-ink-300 sm:flex sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} TokoFianar — Tous droits réservés.</p>
            <p className="mt-2 sm:mt-0">Projet académique de conception et développement.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
