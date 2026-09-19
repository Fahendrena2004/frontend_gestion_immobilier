import { useEffect, useState } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/shared/Alert'
import { authService } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'

const ROLE_LABEL = {
  LOCATAIRE: 'Locataire',
  PROPRIETAIRE: 'Propriétaire',
  ADMINISTRATEUR: 'Administrateur',
}

export default function ProfilPage() {
  const { user, role, updateUser } = useAuth()

  const [activeTab, setActiveTab] = useState('profil')

  const [form, setForm] = useState({ nom: '', telephone: '', cin: '', profession: '', adresse: '' })
  const [saving, setSaving] = useState(false)
  const [profilError, setProfilError] = useState(null)
  const [profilFieldErrors, setProfilFieldErrors] = useState({})
  const [profilSuccess, setProfilSuccess] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirmation: '',
  })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdError, setPwdError] = useState(null)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  // Le profil est rechargé dans le contexte au démarrage de l'application :
  // on réinitialise le formulaire dès qu'il est disponible.
  useEffect(() => {
    if (!user) return
    setForm({
      nom: user.nom ?? '',
      telephone: user.telephone ?? '',
      cin: user.cin ?? '',
      profession: user.profession ?? '',
      adresse: user.adresse ?? '',
    })
  }, [user])

  function setChamp(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }))
    setProfilSuccess(false)
  }

  async function handleSaveProfil(e) {
    e.preventDefault()
    setSaving(true)
    setProfilError(null)
    setProfilFieldErrors({})
    setProfilSuccess(false)

    try {
      // L'API n'accepte la profession que pour un locataire et l'adresse que
      // pour un propriétaire : on n'envoie que les champs pertinents.
      const payload = {
        nom: form.nom,
        telephone: form.telephone,
        cin: form.cin,
      }
      if (role === 'LOCATAIRE') payload.profession = form.profession
      if (role === 'PROPRIETAIRE') payload.adresse = form.adresse

      const profil = await authService.updateProfile(payload)
      updateUser(profil)
      setProfilSuccess(true)
    } catch (err) {
      setProfilError(err.message)
      if (err.errors) {
        setProfilFieldErrors(
          Object.fromEntries(Object.entries(err.errors).map(([champ, msgs]) => [champ, msgs[0]]))
        )
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwdError(null)
    setPwdSuccess(false)

    if (passwordForm.newPassword !== passwordForm.newPasswordConfirmation) {
      setPwdError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setPwdSaving(true)
    try {
      await authService.changePassword(passwordForm)
      setPwdSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', newPasswordConfirmation: '' })
    } catch (err) {
      setPwdError(err.message)
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-900 lg:text-3xl">Mon profil</h1>
        <p className="mt-2 text-ink-500">Gérez vos informations personnelles et votre sécurité.</p>
      </div>

      <div className="mb-6 border-b border-ink-200">
        <nav className="flex gap-8" aria-label="Sections du profil">
          <Onglet
            actif={activeTab === 'profil'}
            icon={User}
            label="Informations"
            onClick={() => setActiveTab('profil')}
          />
          <Onglet
            actif={activeTab === 'securite'}
            icon={Lock}
            label="Sécurité"
            onClick={() => setActiveTab('securite')}
          />
        </nav>
      </div>

      {activeTab === 'profil' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-brand-600" /> Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfil} className="flex flex-col gap-5">
              {profilError && <Alert message={profilError} />}
              {profilSuccess && <Alert variant="success" message="Profil mis à jour avec succès." />}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Nom complet *"
                  required
                  value={form.nom}
                  error={profilFieldErrors.name}
                  onChange={(e) => setChamp('nom', e.target.value)}
                />
                <Input
                  label="Adresse e-mail"
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  readOnly
                  hint="L'adresse e-mail ne peut pas être modifiée."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Téléphone"
                  type="tel"
                  value={form.telephone}
                  error={profilFieldErrors.telephone}
                  onChange={(e) => setChamp('telephone', e.target.value)}
                />
                <Input
                  label="N° CIN"
                  value={form.cin}
                  error={profilFieldErrors.cin}
                  onChange={(e) => setChamp('cin', e.target.value)}
                />
              </div>

              {role === 'LOCATAIRE' && (
                <Input
                  label="Profession"
                  value={form.profession}
                  error={profilFieldErrors.profession}
                  onChange={(e) => setChamp('profession', e.target.value)}
                />
              )}

              {role === 'PROPRIETAIRE' && (
                <Input
                  label="Adresse"
                  value={form.adresse}
                  error={profilFieldErrors.adresse}
                  onChange={(e) => setChamp('adresse', e.target.value)}
                />
              )}

              <div className="border-t border-ink-100 pt-4 text-xs text-ink-500">
                <p>Membre depuis le {formatDate(user?.dateInscription)}</p>
                <p className="mt-1">Rôle : {ROLE_LABEL[role] ?? '—'}</p>
              </div>

              <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'securite' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-brand-600" /> Sécurité du compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="flex max-w-md flex-col gap-5">
              <ChampMotDePasse
                id="currentPassword"
                label="Mot de passe actuel"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                visible={showCurrentPwd}
                onToggle={() => setShowCurrentPwd((v) => !v)}
                disabled={pwdSaving}
                onChange={(v) => setPasswordForm((f) => ({ ...f, currentPassword: v }))}
              />
              <ChampMotDePasse
                id="newPassword"
                label="Nouveau mot de passe"
                autoComplete="new-password"
                minLength={8}
                hint="Minimum 8 caractères."
                value={passwordForm.newPassword}
                visible={showNewPwd}
                onToggle={() => setShowNewPwd((v) => !v)}
                disabled={pwdSaving}
                onChange={(v) => setPasswordForm((f) => ({ ...f, newPassword: v }))}
              />
              <ChampMotDePasse
                id="newPasswordConfirmation"
                label="Confirmer le nouveau mot de passe"
                autoComplete="new-password"
                minLength={8}
                value={passwordForm.newPasswordConfirmation}
                visible={showConfirmPwd}
                onToggle={() => setShowConfirmPwd((v) => !v)}
                disabled={pwdSaving}
                onChange={(v) => setPasswordForm((f) => ({ ...f, newPasswordConfirmation: v }))}
              />

              {pwdError && <Alert message={pwdError} />}
              {pwdSuccess && <Alert variant="success" message="Mot de passe modifié avec succès." />}

              <Button type="submit" size="lg" disabled={pwdSaving} className="w-full sm:w-auto">
                {pwdSaving ? 'Modification…' : 'Modifier le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Onglet({ actif, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={actif ? 'page' : undefined}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        actif ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-700'
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  )
}

function ChampMotDePasse({
  id, label, value, onChange, visible, onToggle, disabled, hint, autoComplete, minLength,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-ink-200 bg-white py-3 pl-10 pr-12 text-ink-900 transition-colors placeholder:text-ink-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-ink-50"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600"
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  )
}
