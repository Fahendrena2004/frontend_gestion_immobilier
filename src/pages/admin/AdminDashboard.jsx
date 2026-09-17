import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ClipboardList, Wallet, TrendingUp, Users, ShieldCheck, BarChart3, Wallet as WalletIcon, Home, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { reportingService } from '@/services/reportingService'
import { formatMoney } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportingService.getDashboardStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (!stats) return null

  const maxEvolution = Math.max(...stats.evolutionDemandes.map((e) => e.valeur))

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(189,143,52,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Tableau de bord administrateur
            </h1>
            <p className="mt-2 text-lg text-brand-100/90 max-w-2xl">
              Supervisez l'activité globale de la plateforme : logements, demandes, paiements et revenus.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Building2}
            label="Logements disponibles"
            value={`${stats.logementsDisponibles} / ${stats.totalLogements}`}
            to="/admin/moderation"
            iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
            iconColor="text-white"
          />
          <StatCard
            icon={ClipboardList}
            label="Demandes en attente"
            value={stats.demandesEnAttente}
            to="/admin/moderation"
            highlight={stats.demandesEnAttente > 0}
            iconBg="bg-gradient-to-br from-gold-500 to-gold-700"
            iconColor="text-white"
          />
          <StatCard
            icon={Wallet}
            label="Paiements à vérifier"
            value={stats.paiementsEnAttenteVerification}
            to="/admin/paiements"
            highlight={stats.paiementsEnAttenteVerification > 0}
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
            iconColor="text-white"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenus du mois"
            value={formatMoney(stats.revenusDuMois)}
            to="/admin/statistiques"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
            iconColor="text-white"
          />
        </div>

        {/* Quick Actions */}
        <section className="mt-10">
          <h2 className="font-display text-xl lg:text-2xl font-bold text-ink-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              icon={ShieldCheck}
              label="Modérer les annonces"
              description={`${stats.logementsDisponibles} dispo, ${stats.totalLogements - stats.logementsDisponibles} en attente`}
              to="/admin/moderation"
              iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
              iconColor="text-white"
            />
            <QuickActionCard
              icon={Users}
              label="Gérer les comptes"
              description={`${stats.utilisateursTotal || '—'} utilisateurs`}
              to="/admin/comptes"
              iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
              iconColor="text-white"
            />
            <QuickActionCard
              icon={Wallet}
              label="Vérifier les paiements"
              description={`${stats.paiementsEnAttenteVerification} en attente`}
              to="/admin/paiements"
              highlight={stats.paiementsEnAttenteVerification > 0}
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
              iconColor="text-white"
            />
            <QuickActionCard
              icon={BarChart3}
              label="Voir les statistiques"
              description="Évolution, revenus, répartition"
              to="/admin/statistiques"
              iconBg="bg-gradient-to-br from-gold-500 to-gold-700"
              iconColor="text-white"
            />
          </div>
        </section>

        {/* Evolution Chart */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
            <div>
              <h2 className="font-display text-xl lg:text-2xl font-bold text-ink-900">Évolution des demandes de location</h2>
              <p className="mt-1 text-sm text-ink-500">5 derniers mois</p>
            </div>
            <Link to="/admin/statistiques" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Voir le détail
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <Card className="bg-white border-ink-100 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex h-56 items-end gap-3 sm:gap-4">
                {stats.evolutionDemandes.map((e) => (
                  <div key={e.mois} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400"
                      style={{ height: maxEvolution > 0 ? `${(e.valeur / maxEvolution) * 100}%` : '0%', minHeight: '4px' }}
                      title={`${e.valeur} demandes`}
                    />
                    <span className="text-xs font-medium text-ink-500">{e.mois}</span>
                    <span className="text-xs font-semibold text-brand-600">{e.valeur}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Platform Health */}
        <section className="mt-10">
          <h2 className="font-display text-xl lg:text-2xl font-bold text-ink-900 mb-4">Santé de la plateforme</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HealthCard
              icon={Home}
              label="Taux d'occupation"
              value={stats.totalLogements > 0 ? `${Math.round(((stats.totalLogements - stats.logementsDisponibles) / stats.totalLogements) * 100)}%` : '—'}
              description={`${stats.logementsDisponibles} dispo sur ${stats.totalLogements}`}
              iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
              iconColor="text-white"
            />
            <HealthCard
              icon={ClipboardList}
              label="Taux de conversion"
              value={stats.demandesEnAttente > 0 ? `${Math.round((stats.demandesAcceptees || 0) / (stats.demandesEnAttente + (stats.demandesAcceptees || 0)) * 100)}%` : '—'}
              description={`${stats.demandesEnAttente} en attente`}
              iconBg="bg-gradient-to-br from-gold-500 to-gold-700"
              iconColor="text-white"
            />
            <HealthCard
              icon={WalletIcon}
              label="Paiements validés"
              value={stats.paiementsValides || '—'}
              description={`${stats.paiementsEnAttenteVerification} en attente`}
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
              iconColor="text-white"
            />
            <HealthCard
              icon={Shield}
              label="Taux de modération"
              value={stats.tauxModeration || '—'}
              description={`${stats.annoncesModerees || '—'} annonces traitées`}
              iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
              iconColor="text-white"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to, highlight, iconBg, iconColor }) {
  return (
    <Link to={to}>
      <Card className={`bg-white border-ink-100 shadow-sm transition-all hover:shadow-md ${highlight ? 'border-gold-300 shadow-gold-100/50' : ''}`}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">{label}</p>
            <p className="font-display text-2xl font-bold text-ink-900 mt-1">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickActionCard({ icon: Icon, label, description, to, highlight, iconBg, iconColor }) {
  return (
    <Link to={to}>
      <Card className={`bg-white border-ink-100 shadow-sm transition-all hover:shadow-md ${highlight ? 'border-gold-300 shadow-gold-100/50' : ''}`}>
        <CardContent className="flex flex-col gap-3 p-5 h-full">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold text-ink-900">{label}</p>
            <p className="text-xs text-ink-500 mt-1">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function HealthCard({ icon: Icon, label, value, description, iconBg, iconColor }) {
  return (
    <Card className="bg-white border-ink-100 shadow-sm transition-all hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">{label}</p>
          <p className="font-display text-2xl font-bold text-ink-900 mt-1">{value}</p>
          <p className="text-xs text-ink-500 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}