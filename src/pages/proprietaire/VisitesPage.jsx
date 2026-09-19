import { useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { formatDateTime } from '@/lib/utils'

/**
 * Rôle attendu par l'API pour chaque transition :
 *   demandee  -> proposee   propriétaire (c'est lui qui propose le créneau)
 *   proposee  -> confirmee  locataire
 *   confirmee -> realisee   propriétaire
 *   *         -> annulee    les deux
 * L'interface n'expose donc au propriétaire que ses propres transitions.
 */
const AIDE_PAR_STATUT = {
  DEMANDEE: 'Le locataire attend une proposition de créneau.',
  PROPOSEE: 'Créneau envoyé : en attente de confirmation du locataire.',
  CONFIRMEE: 'Visite confirmée par le locataire. Consignez son résultat une fois effectuée.',
  ANNULEE: 'Visite annulée.',
  REALISEE: 'Visite effectuée.',
}

/** Format attendu par <input type="datetime-local"> : « AAAA-MM-JJTHH:MM ». */
function dansUneHeure() {
  const date = new Date(Date.now() + 60 * 60 * 1000)
  date.setMinutes(0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`
}

export default function VisitesPage() {
  const { data: visites, setData: setVisites, loading, error, reload } = useApiResource(
    () => rentalService.listVisites(),
    [],
    { initialData: [] }
  )

  const [visiteAPlanifier, setVisiteAPlanifier] = useState(null)
  const [creneau, setCreneau] = useState('')
  const [visiteACloturer, setVisiteACloturer] = useState(null)
  const [resultat, setResultat] = useState('')

  const [actionEnCours, setActionEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [dialogError, setDialogError] = useState(null)

  function remplacer(misAJour) {
    setVisites((prev) => prev.map((v) => (v.id === misAJour.id ? { ...v, ...misAJour } : v)))
  }

  async function annuler(id) {
    setActionEnCours(id)
    setActionError(null)
    try {
      remplacer(await rentalService.annulerVisite(id))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  async function proposerCreneau() {
    setActionEnCours(visiteAPlanifier.id)
    setDialogError(null)
    try {
      remplacer(await rentalService.proposerVisite(visiteAPlanifier.id, creneau))
      setVisiteAPlanifier(null)
    } catch (err) {
      setDialogError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  async function cloturer() {
    setActionEnCours(visiteACloturer.id)
    setDialogError(null)
    try {
      remplacer(await rentalService.cloturerVisite(visiteACloturer.id, resultat))
      setVisiteACloturer(null)
    } catch (err) {
      setDialogError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Visites</h1>
      <p className="mt-1 text-sm text-ink-500">
        Proposez un créneau aux locataires qui ont demandé à visiter vos logements, puis consignez
        le résultat de la visite.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les visites" message={error}>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des visites…" />}

        {!loading && !error && visites.length === 0 && (
          <EmptyState
            icon={CalendarCheck}
            title="Aucune visite demandée"
            description="Les demandes de visite envoyées par les locataires depuis vos annonces apparaîtront ici."
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
                    {v.dateProposee ? formatDateTime(v.dateProposee) : 'Aucun créneau proposé'}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">{AIDE_PAR_STATUT[v.statut]}</p>
                  {v.resultat && <p className="mt-1 text-xs text-ink-500">Résultat : {v.resultat}</p>}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <StatusBadge status={v.statut} />

                  {v.statut === 'DEMANDEE' && (
                    <Button
                      size="sm"
                      disabled={enCours}
                      onClick={() => {
                        setVisiteAPlanifier(v)
                        setCreneau(dansUneHeure())
                        setDialogError(null)
                      }}
                    >
                      Proposer un créneau
                    </Button>
                  )}

                  {v.statut === 'CONFIRMEE' && (
                    <Button
                      size="sm"
                      disabled={enCours}
                      onClick={() => {
                        setVisiteACloturer(v)
                        setResultat('')
                        setDialogError(null)
                      }}
                    >
                      Consigner le résultat
                    </Button>
                  )}

                  {['DEMANDEE', 'PROPOSEE', 'CONFIRMEE'].includes(v.statut) && (
                    <Button size="sm" variant="outline" disabled={enCours} onClick={() => annuler(v.id)}>
                      Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog
        open={!!visiteAPlanifier}
        onClose={() => setVisiteAPlanifier(null)}
        title="Proposer un créneau de visite"
        description={visiteAPlanifier?.logementTitre}
        footer={
          <>
            <Button variant="outline" onClick={() => setVisiteAPlanifier(null)}>Annuler</Button>
            <Button onClick={proposerCreneau} disabled={!creneau || actionEnCours === visiteAPlanifier?.id}>
              {actionEnCours === visiteAPlanifier?.id ? 'Envoi…' : 'Proposer ce créneau'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {dialogError && <Alert message={dialogError} />}
          <Input
            label="Date et heure proposées *"
            type="datetime-local"
            value={creneau}
            min={dansUneHeure()}
            hint="Le créneau doit être situé dans le futur. Le locataire devra le confirmer."
            onChange={(e) => setCreneau(e.target.value)}
          />
        </div>
      </Dialog>

      <Dialog
        open={!!visiteACloturer}
        onClose={() => setVisiteACloturer(null)}
        title="Résultat de la visite"
        description={visiteACloturer?.logementTitre}
        footer={
          <>
            <Button variant="outline" onClick={() => setVisiteACloturer(null)}>Annuler</Button>
            <Button onClick={cloturer} disabled={actionEnCours === visiteACloturer?.id}>
              {actionEnCours === visiteACloturer?.id ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {dialogError && <Alert message={dialogError} />}
          <Input
            label="Issue de la visite"
            value={resultat}
            maxLength={255}
            placeholder="ex : Visite concluante, le locataire souhaite déposer une demande"
            hint="Texte libre, 255 caractères maximum."
            onChange={(e) => setResultat(e.target.value)}
          />
        </div>
      </Dialog>
    </div>
  )
}
