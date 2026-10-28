import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, KeyRound, User2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/shared/Alert'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const SPACE_BY_ROLE = {
  LOCATAIRE: '/locataire',
  PROPRIETAIRE: '/proprietaire',
}

const EMPTY_FORM = {
  nom: '',
  email: '',
  telephone: '',
  cin: '',
  profession: '',
  adresse: '',
  password: '',
  passwordConfirmation: '',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('LOCATAIRE')
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  // Erreurs de validation renvoyées par l'API, champ par champ.
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function setField(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }))
    setFieldErrors((e) => (e[champ] ? { ...e, [champ]: null } : e))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (form.password !== form.passwordConfirmation) {
      setFieldErrors({ password_confirmation: 'Les deux mots de passe ne correspondent pas.' })
      return
    }

    setLoading(true)
    try {
      await register({ ...form, role })
      navigate(SPACE_BY_ROLE[role], { replace: true })
    } catch (err) {
      setError(err.message || 'Impossible de créer le compte.')
      // { name: [...], email: [...] } -> { name: '…', email: '…' }
      if (err.errors) {
        setFieldErrors(
          Object.fromEntries(Object.entries(err.errors).map(([champ, messages]) => [champ, messages[0]]))
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link to="/" className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-700">
            <Home className="h-5 w-5 text-gold-300" />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Créer un compte</h1>
          <p className="mt-1 text-sm text-ink-500">Rejoignez TokoFianar en quelques instants.</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <RoleOption
            active={role === 'LOCATAIRE'}
            icon={User2}
            title="Locataire"
            subtitle="Je cherche un logement"
            onClick={() => setRole('LOCATAIRE')}
          />
          <RoleOption
            active={role === 'PROPRIETAIRE'}
            icon={KeyRound}
            title="Propriétaire"
            subtitle="Je propose un logement"
            onClick={() => setRole('PROPRIETAIRE')}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
          {error && <Alert message={error} />}

          <Input
            label="Nom complet *"
            name="nom"
            placeholder="Rakoto Andriamalala"
            required
            value={form.nom}
            error={fieldErrors.name}
            onChange={(e) => setField('nom', e.target.value)}
          />
          <Input
            label="Adresse e-mail *"
            type="email"
            name="email"
            placeholder="vous@exemple.mg"
            required
            value={form.email}
            error={fieldErrors.email}
            onChange={(e) => setField('email', e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Téléphone *"
              type="tel"
              name="telephone"
              placeholder="034 00 000 00"
              required
              value={form.telephone}
              error={fieldErrors.telephone}
              onChange={(e) => setField('telephone', e.target.value)}
            />
            <Input
              label="N° CIN *"
              name="cin"
              placeholder="101 234 567 890"
              required
              value={form.cin}
              error={fieldErrors.cin}
              hint="Obligatoire pour signer un contrat."
              onChange={(e) => setField('cin', e.target.value)}
            />
          </div>

          {role === 'LOCATAIRE' ? (
            <Input
              label="Profession"
              name="profession"
              placeholder="ex : Enseignant"
              value={form.profession}
              error={fieldErrors.profession}
              onChange={(e) => setField('profession', e.target.value)}
            />
          ) : (
            <Input
              label="Adresse"
              name="adresse"
              placeholder="ex : Lot II M 12, Andrainjato"
              value={form.adresse}
              error={fieldErrors.adresse}
              onChange={(e) => setField('adresse', e.target.value)}
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Mot de passe *"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              required
              minLength={8}
              value={form.password}
              error={fieldErrors.password}
              onChange={(e) => setField('password', e.target.value)}
            />
            <Input
              label="Confirmer le mot de passe *"
              type="password"
              name="passwordConfirmation"
              autoComplete="new-password"
              placeholder="Répétez le mot de passe"
              required
              minLength={8}
              value={form.passwordConfirmation}
              error={fieldErrors.password_confirmation}
              onChange={(e) => setField('passwordConfirmation', e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
            {loading
              ? 'Création du compte…'
              : `Créer mon compte ${role === 'LOCATAIRE' ? 'locataire' : 'propriétaire'}`}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Déjà inscrit ?{' '}
          <Link to="/connexion" className="font-medium text-brand-700 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

function RoleOption({ active, icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors',
        active ? 'border-brand-600 bg-brand-50' : 'border-ink-100 bg-white hover:border-ink-200'
      )}
    >
      <Icon className={cn('h-5 w-5', active ? 'text-brand-700' : 'text-ink-400')} />
      <div>
        <p className={cn('text-sm font-semibold', active ? 'text-brand-800' : 'text-ink-900')}>{title}</p>
        <p className="text-xs text-ink-500">{subtitle}</p>
      </div>
    </button>
  )
}
