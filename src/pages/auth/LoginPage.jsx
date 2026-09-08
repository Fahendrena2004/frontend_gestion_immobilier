import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, LogIn } from 'lucide-react'
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
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-700">
            <Home className="h-5 w-5 text-gold-300" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Content de vous revoir</h1>
          <p className="mt-1 text-sm text-ink-500">Connectez-vous à votre espace TokoFianar.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
          <Input
            label="Adresse e-mail"
            type="email"
            name="email"
            placeholder="vous@exemple.mg"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="rounded-md bg-brick-50 px-3 py-2 text-sm text-brick-600">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
            <LogIn className="h-4 w-4" />
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
          <p className="text-center text-xs text-ink-400">
            Démo : utilisez un e-mail contenant « admin » ou « proprio » pour tester ces rôles.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-medium text-brand-700 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
