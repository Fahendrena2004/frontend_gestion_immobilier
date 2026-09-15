import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Mail, Phone, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'

export default function ProfilPage() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profil')
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    cin: user?.cin || '',
    profession: user?.profession || '',
    adresse: user?.adresse || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirmation: '',
  })
  const [saving, setSaving] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdError, setPwdError] = useState(null)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  async function handleSaveProfil(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await authService.updateProfile(form)
      alert('Profil mis à jour avec succès')
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwdError(null)
    setPwdSuccess(false)
    if (passwordForm.newPassword !== passwordForm.newPasswordConfirmation) {
      setPwdError('Les deux mots de passe ne correspondent pas')
      return
    }
    setPwdSaving(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        newPasswordConfirmation: passwordForm.newPasswordConfirmation,
      })
      setPwdSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', newPasswordConfirmation: '' })
    } catch (err) {
      setPwdError(err.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setPwdSaving(false)
    }
  }

  const roleLabel = {
    LOCATAIRE: 'Espace locataire',
    PROPRIETAIRE: 'Espace propriétaire',
    ADMINISTRATEUR: 'Espace administrateur',
  }[role] || 'Espace'

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">Mon profil</h1>
          <p className="mt-2 text-ink-500">Gérez vos informations personnelles et votre sécurité</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-ink-200">
          <nav className="flex gap-8" aria-label="Sections du profil">
            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profil'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <User className="h-4 w-4" /> Informations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('securite')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'securite'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <Lock className="h-4 w-4" /> Sécurité
            </button>
          </nav>
        </div>

        {/* Profil Tab */}
        {activeTab === 'profil' && (
          <Card className="bg-white border-ink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-brand-600" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfil} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Nom complet"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Téléphone"
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  />
                  <Input
                    label="CIN"
                    value={form.cin}
                    onChange={(e) => setForm({ ...form, cin: e.target.value })}
                  />
                </div>
                {role === 'LOCATAIRE' && (
                  <Input
                    label="Profession"
                    value={form.profession}
                    onChange={(e) => setForm({ ...form, profession: e.target.value })}
                  />
                )}
                {role === 'PROPRIETAIRE' && (
                  <Input
                    label="Adresse"
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    multiline
                    rows={3}
                  />
                )}
                <div className="pt-4 border-t border-ink-100">
                  <p className="text-xs text-ink-500 mb-3">Membre depuis le {formatDate(user?.created_at)}</p>
                  <p className="text-xs text-ink-500">Rôle : {role === 'LOCATAIRE' ? 'Locataire' : role === 'PROPRIETAIRE' ? 'Propriétaire' : 'Administrateur'}</p>
                </div>
                <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
                  {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sécurité Tab */}
        {activeTab === 'securite' && (
          <Card className="bg-white border-ink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-600" />
                Sécurité du compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-ink-700 mb-1.5">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" aria-hidden="true" />
                    <input
                      id="currentPassword"
                      type={showCurrentPwd ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:bg-ink-50 disabled:cursor-not-allowed"
                      disabled={pwdSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                      aria-label={showCurrentPwd ? 'Masquer' : 'Afficher'}
                    >
                      {showCurrentPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-ink-700 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" aria-hidden="true" />
                    <input
                      id="newPassword"
                      type={showNewPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:bg-ink-50 disabled:cursor-not-allowed"
                      disabled={pwdSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                      aria-label={showNewPwd ? 'Masquer' : 'Afficher'}
                    >
                      {showNewPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">Minimum 8 caractères</p>
                </div>

                <div>
                  <label htmlFor="newPasswordConfirmation" className="block text-sm font-medium text-ink-700 mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" aria-hidden="true" />
                    <input
                      id="newPasswordConfirmation"
                      type={showConfirmPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={passwordForm.newPasswordConfirmation}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPasswordConfirmation: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:bg-ink-50 disabled:cursor-not-allowed"
                      disabled={pwdSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                      aria-label={showConfirmPwd ? 'Masquer' : 'Afficher'}
                    >
                      {showConfirmPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {pwdError && (
                  <div className="p-3 rounded-lg bg-brick-50 border border-brick-200 flex items-start gap-2" role="alert">
                    <AlertCircle className="h-5 w-5 text-brick-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-brick-600">{pwdError}</p>
                  </div>
                )}

                {pwdSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2" role="status">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-600">Mot de passe modifié avec succès</p>
                  </div>
                )}

                <Button type="submit" size="lg" disabled={pwdSaving} className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg">
                  {pwdSaving ? 'Modification…' : 'Modifier le mot de passe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}