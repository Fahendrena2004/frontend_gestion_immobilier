import { useState } from 'react'
import { Building2, CalendarCheck, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState, { Spinner } from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { cn } from '@/lib/utils'

/**
 * Rôle attendu par l'API pour chaque transition :
 *   demandee  -> proposee   propriétaire (c'est lui qui propose le créneau)
 *   proposee  -> confirmee  locataire
 *   confirmee -> realisee   propriétaire
 *   *         -> annulee    les deux
 * L'interface n'expose donc au propriétaire que ses propres transitions.
 */

/** Statuts de visite réellement utilisés (VisiteStatus backend). */
const STATUTS_VISITE = {
  DEMANDEE: {
    label: 'Demandée',
    className: 'bg-gold-50 text-gold-700 ring-gold-300/60',
    dot: 'bg-gold-500',
  },
  PROPOSEE: {
    label: 'Créneau proposé',
    className: 'bg-gold-50 text-gold-700 ring-gold-300/60',
    dot: 'bg-gold-500',
  },
  CONFIRMEE: {
    label: 'Confirmée',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  REALISEE: {
    label: 'Réalisée',
    className: 'bg-brand-50 text-brand-700 ring-brand-300/60',
    dot: 'bg-brand-500',
  },
  ANNULEE: {
    label: 'Annulée',
    className: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  },
}

/** Badge de statut local à la page (les composants partagés ne sont pas modifiés). */
function BadgeStatutVisite({ status }) {
  const config = STATUTS_VISITE[status] ?? {
    label: status ?? '—',
    className: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
        config.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  )
}

/** Jour du créneau (« mer. 12 mars »), distinct de l'horaire. */
function formatJour(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' }).format(new Date(iso))
}

/** Horaire seul du créneau (« 14:00 »). */
function formatHeure(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

/** Créneau proposé, présenté avec une hiérarchie date / heure. */
function Creneau({ dateProposee }) {
  return (
    <div className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-ink-100 bg-brand-50/50 px-3 py-1.5">
      <Clock className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
      {dateProposee ? (
        <>
          <span className="text-sm font-medium text-ink-800">{formatJour(dateProposee)}</span>
          <span className="text-xs text-ink-400" aria-hidden="true">·</span>
          <span className="text-sm font-semibold tabular-nums text-brand-700">{formatHeure(dateProposee)}</span>
        </>
      ) : (
        <span className="text-sm text-ink-400">Aucun créneau proposé</span>
      )}
    </div>
  )
}

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
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
            <CalendarCheck className="h-5 w-5 text-gold-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Espace propriétaire
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
              Visites
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Proposez un créneau aux locataires qui ont demandé à visiter vos logements, puis consignez
              le résultat de la visite.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les visites" message={error}>
            <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des visites…" className="rounded-xl border border-ink-100 bg-white py-12" />}

        {!loading && !error && visites.length === 0 && (
          <EmptyState
            icon={CalendarCheck}
            title="Aucune visite demandée"
            description="Les demandes de visite envoyées par les locataires depuis vos annonces apparaîtront ici."
            className="rounded-xl bg-white py-12"
          />
        )}

        {visites.map((v) => {
          const enCours = actionEnCours === v.id
          return (
            <Card key={v.id} className="rounded-xl transition-shadow duration-200 motion-safe:hover:shadow-md">
              <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 gap-3">
                  <Avatar name={v.locataireNom} />
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-ink-900">{v.locataireNom}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-brand-400" aria-hidden="true" />
                      <span className="truncate">{v.logementTitre}</span>
                    </p>
                    <Creneau dateProposee={v.dateProposee} />
                    <p className="mt-1.5 text-xs text-ink-400">{AIDE_PAR_STATUT[v.statut]}</p>
                    {v.resultat && (
                      <p className="mt-2 max-w-md whitespace-pre-line rounded-r-lg border-l-2 border-gold-500/50 bg-ink-50/70 py-1.5 pl-3 pr-3 text-xs leading-relaxed text-ink-700">
                        Résultat : {v.resultat}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:justify-end">
                  <BadgeStatutVisite status={v.statut} />

                  {enCours ? (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
                      <Spinner className="h-4 w-4 border-2" />
                      Traitement…
                    </span>
                  ) : (
                    <>
                      {v.statut === 'DEMANDEE' && (
                        <Button
                          size="sm"
                          className="rounded-lg shadow-sm transition-all duration-150 hover:shadow"
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
                          className="rounded-lg shadow-sm transition-all duration-150 hover:shadow"
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg transition-all duration-150 hover:border-brick-300 hover:text-brick-600"
                          onClick={() => annuler(v.id)}
                        >
                          Annuler
                        </Button>
                      )}
                    </>
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
        className="rounded-xl border border-ink-100 shadow-2xl"
        title="Proposer un créneau de visite"
        description={visiteAPlanifier?.logementTitre}
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setVisiteAPlanifier(null)}>Annuler</Button>
            <Button className="rounded-lg shadow-sm" onClick={proposerCreneau} disabled={!creneau || actionEnCours === visiteAPlanifier?.id}>
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
        className="rounded-xl border border-ink-100 shadow-2xl"
        title="Résultat de la visite"
        description={visiteACloturer?.logementTitre}
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setVisiteACloturer(null)}>Annuler</Button>
            <Button className="rounded-lg shadow-sm" onClick={cloturer} disabled={actionEnCours === visiteACloturer?.id}>
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
