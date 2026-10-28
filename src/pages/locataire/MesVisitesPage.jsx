import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarDays, CalendarX2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState, { Spinner } from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { cn, formatDate } from '@/lib/utils'

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

/** Message d'accompagnement selon l'étape de la visite. */
const AIDE_PAR_STATUT = {
  DEMANDEE: "En attente d'une proposition de créneau par le propriétaire.",
  PROPOSEE: 'Un créneau vous est proposé : confirmez-le ou annulez la visite.',
  CONFIRMEE: 'Visite confirmée. Le propriétaire en consignera le résultat.',
  ANNULEE: 'Cette visite a été annulée.',
  REALISEE: 'Cette visite a eu lieu.',
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
        <span className="text-sm text-ink-400">Créneau non encore proposé</span>
      )}
    </div>
  )
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
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
            <CalendarDays className="h-5 w-5 text-gold-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Espace locataire
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
              Mes visites
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Demandez une visite depuis la fiche d'un logement, puis confirmez le créneau proposé par le propriétaire.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger vos visites" message={error}>
            <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement de vos visites…" className="rounded-xl border border-ink-100 bg-white py-12" />}

        {!loading && !error && visites.length === 0 && (
          <EmptyState
            icon={CalendarX2}
            title="Aucune visite planifiée"
            description="Depuis la fiche d'un logement, cliquez sur « Demander une visite »."
            className="rounded-xl bg-white py-12"
            action={<Link to="/"><Button className="rounded-lg shadow-sm">Voir les logements</Button></Link>}
          />
        )}

        {visites.map((v) => {
          const enCours = actionEnCours === v.id
          return (
            <Card key={v.id} className="rounded-xl transition-shadow duration-200 motion-safe:hover:shadow-md">
              <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <Building2 className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-ink-900">{v.logementTitre}</p>
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

                  {v.statut === 'PROPOSEE' && (
                    enCours ? (
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
                        <Spinner className="h-4 w-4 border-2" />
                        Traitement…
                      </span>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="rounded-lg shadow-sm transition-all duration-150 hover:shadow"
                          onClick={() => executer(v.id, () => rentalService.confirmerVisite(v.id))}
                        >
                          Confirmer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg transition-all duration-150 hover:border-brick-300 hover:text-brick-600"
                          onClick={() => executer(v.id, () => rentalService.annulerVisite(v.id))}
                        >
                          Annuler
                        </Button>
                      </>
                    )
                  )}

                  {(v.statut === 'DEMANDEE' || v.statut === 'CONFIRMEE') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg transition-all duration-150 hover:border-brick-300 hover:text-brick-600"
                      disabled={enCours}
                      onClick={() => executer(v.id, () => rentalService.annulerVisite(v.id))}
                    >
                      {enCours ? (
                        <>
                          <Spinner className="h-3.5 w-3.5 border-2" />
                          Annulation…
                        </>
                      ) : (
                        'Annuler'
                      )}
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
