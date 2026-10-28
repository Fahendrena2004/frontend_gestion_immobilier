import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, LogIn, Mail, Lock, Eye, EyeOff, MapPin, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

const SPACE_BY_ROLE = {
  LOCATAIRE: '/locataire',
  PROPRIETAIRE: '/proprietaire',
  ADMINISTRATEUR: '/admin',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(form)
      const from = location.state?.from?.pathname
      navigate(from || SPACE_BY_ROLE[user.role] || '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      {/* ============================================================
          Panneau visuel — desktop uniquement (même hero que HomePage)
          ============================================================ */}
      <aside className="relative hidden overflow-hidden bg-brand-900 lg:flex lg:w-1/2 lg:min-h-screen lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-brand-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(189,143,52,0.18),transparent_55%)]" />

        {/* Logo */}
        <Link to="/" className="animate-fade-in-up relative flex w-fit items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700">
            <Home className="h-5 w-5 text-gold-300" />
          </span>
          <span className="font-display text-xl font-bold text-white">
            Toko<span className="text-gold-400">Fianar</span>
          </span>
        </Link>

        {/* Accroche */}
        <div className="relative max-w-lg">
          <p className="animate-fade-in-up flex items-center gap-2 text-sm font-medium text-gold-300">
            <MapPin className="h-4 w-4" /> Fianarantsoa, Madagascar
          </p>
          <h2 className="animate-fade-in-up animate-delay-100 mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Trouvez votre prochain logement à Fianarantsoa.
          </h2>
          <p className="animate-fade-in-up animate-delay-200 mt-4 text-base leading-relaxed text-brand-100/80">
            Toutes les annonces vérifiées de Fianarantsoa, centralisées en un seul endroit —
            recherchez, visitez et louez en toute transparence.
          </p>
        </div>
      </aside>

      {/* ============================================================
          Formulaire
          ============================================================ */}
      <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          {/* Bandeau compact — mobile uniquement */}
          <div className="animate-fade-in-up mb-10 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700">
                <Home className="h-5 w-5 text-gold-300" />
              </span>
              <span className="font-display text-xl font-bold text-ink-900">
                Toko<span className="text-gold-600">Fianar</span>
              </span>
            </Link>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              Trouvez votre prochain logement à Fianarantsoa.
            </p>
          </div>

          <div className="animate-fade-in-up animate-delay-100 mb-8">
            <h1 className="font-display text-2xl font-bold text-ink-900 lg:text-3xl">Bonjour !</h1>
            <p className="mt-2 text-ink-500">Connectez-vous pour accéder à votre espace</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-brick-50 border border-brick-200 flex items-start gap-2" role="alert">
              <svg className="h-5 w-5 text-brick-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <p className="text-sm text-brick-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vous@exemple.mg"
                  className="w-full rounded-lg border border-ink-200 bg-white py-3 pl-10 pr-4 text-ink-900 placeholder:text-ink-400 transition-shadow duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-ink-50"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-ink-200 bg-white py-3 pl-10 pr-12 text-ink-900 placeholder:text-ink-400 transition-shadow duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-ink-50"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full py-3">
              {loading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion…
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          <div className="animate-fade-in-up animate-delay-200 mt-8 text-center">
            <p className="text-sm text-ink-500">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors">
                Créer un compte
              </Link>
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
