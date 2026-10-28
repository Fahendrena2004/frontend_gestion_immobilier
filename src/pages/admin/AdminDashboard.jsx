import { Link } from 'react-router-dom'
import {
  BarChart3, Building2, ChevronRight, ClipboardList, Home,
  ShieldCheck, TrendingUp, Users, Wallet,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { reportingService } from '@/services/reportingService'
import { formatMoney } from '@/lib/utils'

export default function AdminDashboard() {
  const { data: stats, loading, error, reload } = useApiResource(
    () => reportingService.getDashboardStats(),
    []
  )

  if (loading) return <LoadingState label="Chargement du tableau de bord…" />

  if (error || !stats) {
    return (
      <Alert title="Impossible de charger le tableau de bord" message={error}>
        <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
      </Alert>
    )
  }

  const tauxOccupation = stats.totalLogements > 0
    ? Math.round((stats.logementsLoues / stats.totalLogements) * 100)
    : null

  const maxDemandes = Math.max(0, ...stats.evolutionDemandes.map((p) => p.valeur))

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(189,143,52,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Tableau de bord administrateur
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-brand-100/90">
            Supervisez l'activité de la plateforme : logements, demandes, paiements et revenus.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Building2}
            label="Logements disponibles"
            value={`${stats.logementsDisponibles} / ${stats.totalLogements}`}
            to="/admin/moderation"
            iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
          />
          <StatCard
            icon={ShieldCheck}
            label="Annonces à modérer"
            value={stats.annoncesAModerer}
            to="/admin/moderation"
            highlight={stats.annoncesAModerer > 0}
            iconBg="bg-gradient-to-br from-gold-500 to-gold-700"
          />
          <StatCard
            icon={Wallet}
            label="Paiements à vérifier"
            value={stats.paiementsEnAttenteVerification}
            to="/admin/paiements"
            highlight={stats.paiementsEnAttenteVerification > 0}
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenus encaissés ce mois"
            value={formatMoney(stats.revenusDuMois)}
            to="/admin/statistiques"
            iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
          />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-ink-900 lg:text-2xl">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              icon={ShieldCheck}
              label="Modérer les annonces"
              description={
                stats.annoncesAModerer > 0
                  ? `${stats.annoncesAModerer} annonce${stats.annoncesAModerer > 1 ? 's' : ''} en attente`
                  : 'Aucune annonce en attente'
              }
              to="/admin/moderation"
              highlight={stats.annoncesAModerer > 0}
              iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
            />
            <QuickActionCard
              icon={Users}
              label="Gérer les comptes"
              description={`${stats.utilisateursTotal} utilisateur${stats.utilisateursTotal > 1 ? 's' : ''}`}
              to="/admin/comptes"
              iconBg="bg-gradient-to-br from-brand-400 to-brand-600"
            />
            <QuickActionCard
              icon={Wallet}
              label="Vérifier les paiements"
              description={
                stats.paiementsEnAttenteVerification > 0
                  ? `${stats.paiementsEnAttenteVerification} en attente`
                  : 'Tout est à jour'
              }
              to="/admin/paiements"
              highlight={stats.paiementsEnAttenteVerification > 0}
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
            <QuickActionCard
              icon={BarChart3}
              label="Voir les statistiques"
              description="Évolution, revenus, répartition"
              to="/admin/statistiques"
              iconBg="bg-gradient-to-br from-gold-500 to-gold-700"
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900 lg:text-2xl">
                Évolution des demandes de location
              </h2>
              <p className="mt-1 text-sm text-ink-500">6 derniers mois</p>
            </div>
            <Link
              to="/admin/statistiques"
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Voir le détail <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <Card>
            <CardContent>
              {maxDemandes === 0 ? (
                <p className="py-14 text-center text-sm text-ink-500">
                  Aucune demande de location sur cette période.
                </p>
              ) : (
                <div className="flex h-56 items-end gap-3 sm:gap-4">
                  {stats.evolutionDemandes.map((point) => (
                    <div key={point.periode} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400"
                        style={{ height: `${(point.valeur / maxDemandes) * 100}%`, minHeight: '4px' }}
                        title={`${point.valeur} demande${point.valeur > 1 ? 's' : ''}`}
                      />
                      <span className="text-xs font-medium text-ink-500">{point.mois}</span>
                      <span className="text-xs font-semibold text-brand-600">{point.valeur}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-ink-900 lg:text-2xl">
            Santé de la plateforme
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HealthCard
              icon={Home}
              label="Taux d'occupation"
              value={tauxOccupation != null ? `${tauxOccupation} %` : '—'}
              description={`${stats.logementsLoues} loué${stats.logementsLoues > 1 ? 's' : ''} sur ${stats.totalLogements}`}
              iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
            />
            <HealthCard
              icon={ClipboardList}
              label="Demandes en attente"
              value={stats.demandesEnAttente}
              description="En attente de réponse d'un propriétaire"
              iconBg="bg-gradient-to-br from-gold-500 to-gold-700"
            />
            <HealthCard
              icon={Users}
              label="Locations en cours"
              value={stats.totalLocations}
              description="Contrats actifs sur la plateforme"
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to, highlight, iconBg }) {
  return (
    <Link to={to}>
      <Card className={`transition-all hover:shadow-md ${highlight ? 'border-gold-300' : ''}`}>
        <CardContent className="flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</p>
            <p className="mt-1 truncate font-display text-2xl font-bold text-ink-900">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickActionCard({ icon: Icon, label, description, to, highlight, iconBg }) {
  return (
    <Link to={to}>
      <Card className={`h-full transition-all hover:shadow-md ${highlight ? 'border-gold-300' : ''}`}>
        <CardContent className="flex h-full flex-col gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold text-ink-900">{label}</p>
            <p className="mt-1 text-xs text-ink-500">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function HealthCard({ icon: Icon, label, value, description, iconBg }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-900">{value}</p>
          <p className="mt-1 text-xs text-ink-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
