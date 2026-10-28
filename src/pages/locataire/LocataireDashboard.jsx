import { Link } from 'react-router-dom'
import { FileText, CalendarCheck, KeyRound, Receipt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { contractService } from '@/services/contractService'
import { useAuth } from '@/context/AuthContext'
import { formatMoney, formatDate } from '@/lib/utils'

/** Visites encore en cours de traitement (ni annulées ni réalisées). */
const VISITES_ACTIVES = ['DEMANDEE', 'PROPOSEE', 'CONFIRMEE']

export default function LocataireDashboard() {
  const { user } = useAuth()

  const { data, loading, error, reload } = useApiResource(
    async () => {
      const [demandes, visites, location] = await Promise.all([
        rentalService.listDemandes(),
        rentalService.listVisites(),
        contractService.getMaLocationActive(),
      ])
      return { demandes, visites, location }
    },
    [],
    { initialData: { demandes: [], visites: [], location: null } }
  )

  const { demandes, visites, location } = data

  const demandesEnAttente = demandes.filter((d) => d.statut === 'EN_ATTENTE').length
  const visitesActives = visites.filter((v) => VISITES_ACTIVES.includes(v.statut)).length
  const factureARegler = (location?.factures || []).find(
    (f) => f.statut === 'EN_ATTENTE' || f.statut === 'EN_RETARD'
  )

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">
        Bonjour {user?.nom?.split(' ')[0]} 👋
      </h1>
      <p className="mt-1 text-sm text-ink-500">Voici un aperçu de votre activité locative.</p>

      {error && (
        <Alert title="Certaines données n'ont pas pu être chargées" message={error} className="mt-6">
          <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
        </Alert>
      )}

      {loading ? (
        <LoadingState label="Chargement de votre tableau de bord…" />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={FileText}
              label="Demandes en attente"
              value={demandesEnAttente}
              to="/locataire/demandes"
            />
            <StatCard
              icon={CalendarCheck}
              label="Visites en cours"
              value={visitesActives}
              to="/locataire/visites"
            />
            <StatCard
              icon={KeyRound}
              label="Location active"
              value={location ? 1 : 0}
              to="/locataire/location"
            />
            <StatCard
              icon={Receipt}
              label="Facture à régler"
              value={factureARegler ? formatMoney(factureARegler.montant) : 'Aucune'}
              to="/locataire/location"
              highlight={!!factureARegler}
            />
          </div>

          {location && (
            <Card className="mt-8">
              <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                    Ma location actuelle
                  </p>
                  <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
                    {location.logementTitre}
                  </h2>
                  <p className="text-sm text-ink-500">
                    {location.quartier ? `${location.quartier}, Fianarantsoa · ` : ''}
                    depuis le {formatDate(location.dateDebut)}
                  </p>
                </div>
                <StatusBadge status={location.statut} />
              </CardContent>
            </Card>
          )}

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900">Demandes récentes</h2>
              <Link to="/locataire/demandes" className="text-sm font-medium text-brand-700 hover:underline">
                Voir tout
              </Link>
            </div>
            <Card>
              <div className="divide-y divide-ink-100">
                {demandes.length === 0 && (
                  <p className="px-5 py-6 text-center text-sm text-ink-500">
                    Aucune demande envoyée pour le moment.
                  </p>
                )}
                {demandes.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{d.logementTitre}</p>
                      <p className="text-xs text-ink-500">Envoyée le {formatDate(d.dateEnvoi)}</p>
                    </div>
                    <StatusBadge status={d.statut} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to, highlight }) {
  return (
    <Link to={to}>
      <Card className={highlight ? 'border-gold-300' : ''}>
        <CardContent className="flex items-center gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
              highlight ? 'bg-gold-50 text-gold-600' : 'bg-brand-50 text-brand-700'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-500">{label}</p>
            <p className="truncate font-display text-lg font-semibold text-ink-900">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
