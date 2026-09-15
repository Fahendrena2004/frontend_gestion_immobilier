import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Input from '@/components/ui/Input'
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
    <div className="min-h-screen bg-ink-50">
      {/* Split screen - visual side (desktop only) */}
      <aside className="hidden lg:block lg:w-[45%] lg:min-h-screen lg:flex lg:items-center lg:justify-center lg:p-12 lg:fixed lg:inset-y-0 lg:left-0">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-xl">
            <Home className="h-12 w-12 text-gold-300" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-ink-900 tracking-tight mb-4">
            Toko<span className="text-gold-500">Fianar</span>
          </h2>
          <p className="text-lg text-ink-500 mb-8 max-w-md mx-auto leading-relaxed">
            La plateforme de location de confiance à Fianarantsoa. Trouvez votre logement idéal ou gérez vos biens en toute sérénité.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <p className="font-display text-2xl font-bold text-brand-700">50+</p>
              <p className="text-xs text-ink-500 mt-1">Logements</p>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <p className="font-display text-2xl font-bold text-brand-700">200+</p>
              <p className="text-xs text-ink-500 mt-1">Locataires</p>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <p className="font-display text-2xl font-bold text-brand-700">98%</p>
              <p className="text-xs text-ink-500 mt-1">Satisfaction</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Form side */}
      <main className="lg:w-[55%] lg:ml-[45%] lg:min-h-screen lg:flex lg:items-center lg:justify-center lg:p-8 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-lg">
              <Home className="h-8 w-8 text-gold-300" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Toko<span className="text-gold-500">Fianar</span></h1>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">Bonjour !</h1>
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:bg-ink-50 disabled:cursor-not-allowed"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-ink-700">
                  Mot de passe
                </label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-sm text-brand-600 hover:text-brand-700 underline underline-offset-1 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
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
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:bg-ink-50 disabled:cursor-not-allowed"
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

          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-ink-50 text-ink-400">Ou</span>
              </div>
            </div>
            <p className="text-center text-sm text-ink-500">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}