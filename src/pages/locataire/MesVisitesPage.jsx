import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarX2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { formatDateTime } from '@/lib/utils'

/** Message d'accompagnement selon l'étape de la visite. */
const AIDE_PAR_STATUT = {
  DEMANDEE: "En attente d'une proposition de créneau par le propriétaire.",
  PROPOSEE: 'Un créneau vous est proposé : confirmez-le ou annulez la visite.',
  CONFIRMEE: 'Visite confirmée. Le propriétaire en consignera le résultat.',
  ANNULEE: 'Cette visite a été annulée.',
  REALISEE: 'Cette visite a eu lieu.',
}

export default function MesVisitesPage() {
  const { data: visites, setData: setVisites, loading, error, reload } = useApiResource(
    () => rentalService.listVisites(),
    [],
    { initialData: [] }
  )

  const [actionEnCours, setActionEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)

  async function executer(id, action) {
    setActionEnCours(id)
    setActionError(null)
    try {
      const misAJour = await action()
      setVisites((prev) => prev.map((v) => (v.id === id ? { ...v, ...misAJour } : v)))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Mes visites</h1>
      <p className="mt-1 text-sm text-ink-500">
        Demandez une visite depuis la fiche d'un logement, puis confirmez le créneau proposé par le propriétaire.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger vos visites" message={error}>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement de vos visites…" />}

        {!loading && !error && visites.length === 0 && (
          <EmptyState
            icon={CalendarX2}
            title="Aucune visite planifiée"
            description="Depuis la fiche d'un logement, cliquez sur « Demander une visite »."
            action={<Link to="/"><Button>Voir les logements</Button></Link>}
          />
        )}

        {visites.map((v) => {
          const enCours = actionEnCours === v.id
          return (
            <Card key={v.id}>
              <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-ink-900">{v.logementTitre}</p>
                  <p className="text-sm text-ink-500">
                    {v.dateProposee ? formatDateTime(v.dateProposee) : 'Créneau non encore proposé'}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">{AIDE_PAR_STATUT[v.statut]}</p>
                  {v.resultat && (
                    <p className="mt-1 text-xs text-ink-500">Résultat : {v.resultat}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <StatusBadge status={v.statut} />

                  {v.statut === 'PROPOSEE' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={enCours}
                        onClick={() => executer(v.id, () => rentalService.confirmerVisite(v.id))}
                      >
                        Confirmer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={enCours}
                        onClick={() => executer(v.id, () => rentalService.annulerVisite(v.id))}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}

                  {(v.statut === 'DEMANDEE' || v.statut === 'CONFIRMEE') && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={enCours}
                      onClick={() => executer(v.id, () => rentalService.annulerVisite(v.id))}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
