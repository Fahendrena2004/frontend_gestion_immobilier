import { BarChart3, Building2, ClipboardCheck, Home, KeyRound, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { reportingService } from '@/services/reportingService'
import { formatMoney } from '@/lib/utils'

const ROLE_LABEL = {
  locataire: 'Locataires',
  proprietaire: 'Propriétaires',
  admin: 'Administrateurs',
}

const MODERATION_LABEL = {
  en_attente: 'En attente de validation',
  approuve: 'Approuvées',
  suspendu: 'Suspendues',
  supprime: 'Retirées',
}

const STATUT_LOGEMENT_LABEL = {
  disponible: 'Disponibles',
  reserve: 'Réservés',
  loue: 'Loués',
  indisponible: 'Indisponibles',
}

export default function StatistiquesPage() {
  const { data: stats, loading, error, reload } = useApiResource(
    () => reportingService.getDashboardStats(),
    []
  )

  if (loading) return <LoadingState label="Calcul des statistiques…" className="rounded-xl border border-ink-100 bg-white py-12" />

  if (error || !stats) {
    return (
      <Alert title="Impossible de charger les statistiques" message={error}>
        <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
            <BarChart3 className="h-5 w-5 text-gold-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Administration
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
              Statistiques
            </h1>
            <p className="mt-1 text-sm text-ink-500">Activité globale de la plateforme.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard icon={Building2} label="Logements au total" value={stats.totalLogements} />
        <MetricCard icon={Home} label="Logements disponibles" value={stats.logementsDisponibles} />
        <MetricCard icon={KeyRound} label="Locations en cours" value={stats.totalLocations} />
        <MetricCard icon={ClipboardCheck} label="Annonces à modérer" value={stats.annoncesAModerer} />
        <MetricCard icon={Wallet} label="Paiements à vérifier" value={stats.paiementsEnAttenteVerification} />
        <MetricCard icon={TrendingUp} label="Revenus encaissés ce mois" value={formatMoney(stats.revenusDuMois)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChartCard
          titre="Demandes de location (6 derniers mois)"
          series={stats.evolutionDemandes}
          formatValeur={(v) => v}
        />
        <BarChartCard
          titre="Revenus encaissés (6 derniers mois)"
          series={stats.evolutionRevenus}
          formatValeur={formatMoney}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RepartitionCard
          titre="Comptes par rôle"
          data={stats.usersParRole}
          labels={ROLE_LABEL}
          total={stats.utilisateursTotal}
        />
        <RepartitionCard
          titre="Logements par disponibilité"
          data={stats.logementsParStatut}
          labels={STATUT_LOGEMENT_LABEL}
          total={stats.totalLogements}
        />
        <RepartitionCard
          titre="Annonces par statut de publication"
          data={stats.logementsParModeration}
          labels={MODERATION_LABEL}
          total={stats.totalLogements}
        />
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <Card className="rounded-xl transition-shadow duration-150 hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-brand-800">{value}</p>
        </div>
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
            <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
          </span>
        )}
      </CardContent>
    </Card>
  )
}

/** Histogramme simple. Les barres sont mises à l'échelle de la valeur maximale. */
function BarChartCard({ titre, series, formatValeur }) {
  const valeurs = series.map((point) => point.valeur)
  const max = Math.max(0, ...valeurs)

  return (
    <Card className="rounded-xl">
      <CardHeader className="border-b-2 border-gold-500/30">
        <CardTitle className="text-brand-800">{titre}</CardTitle>
      </CardHeader>
      <CardContent>
        {series.length === 0 || max === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500">
            Aucune donnée sur cette période.
          </p>
        ) : (
          <div className="flex h-48 items-end gap-3">
            {series.map((point) => (
              <div key={point.periode} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-ink-500">
                  {point.valeur ? formatValeur(point.valeur) : ''}
                </span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-700 to-brand-500"
                  style={{ height: `${(point.valeur / max) * 100}%`, minHeight: '4px' }}
                  title={`${point.mois} : ${formatValeur(point.valeur)}`}
                />
                <span className="text-xs font-medium text-ink-500">{point.mois}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/** Répartition en pourcentage d'un objet { clé: nombre }. */
function RepartitionCard({ titre, data, labels, total }) {
  const entrees = Object.entries(data || {})

  return (
    <Card className="rounded-xl">
      <CardHeader className="border-b-2 border-gold-500/30">
        <CardTitle className="text-brand-800">{titre}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entrees.length === 0 && <p className="text-sm text-ink-500">Aucune donnée.</p>}
        {entrees.map(([cle, valeur]) => {
          const pourcentage = total > 0 ? Math.round((valeur / total) * 100) : 0
          return (
            <div key={cle}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600">{labels[cle] ?? cle}</span>
                <span className="font-medium tabular-nums text-ink-900">{valeur}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-gold-400" style={{ width: `${pourcentage}%` }} />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
