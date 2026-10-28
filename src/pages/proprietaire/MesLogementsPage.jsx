import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Building2, ChevronLeft, ChevronRight, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import PropertyCard from '@/components/shared/PropertyCard'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import DropdownMenu from '@/components/ui/DropdownMenu'
import useApiResource from '@/hooks/useApiResource'
import { propertyService } from '@/services/propertyService'
import { cn } from '@/lib/utils'

/** Disponibilités qu'un propriétaire peut fixer lui-même. */
const STATUTS = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'RESERVE', label: 'Réservé' },
  { value: 'LOUE', label: 'Loué' },
  { value: 'INDISPONIBLE', label: 'Indisponible' },
]

const AIDE_MODERATION = {
  EN_ATTENTE: "En attente de validation par un administrateur : l'annonce n'est pas encore publique.",
  APPROUVE: 'Annonce publiée et visible par les locataires.',
  SUSPENDU: "Annonce suspendue par l'administration : elle n'apparaît plus dans les recherches.",
  SUPPRIME: "Annonce retirée par l'administration.",
}

/** Statuts de modération réellement utilisés (ModerationStatus backend). */
const STATUTS_MODERATION = {
  EN_ATTENTE: {
    label: 'En attente',
    className: 'bg-gold-50 text-gold-700 ring-gold-300/60',
    dot: 'bg-gold-500',
  },
  APPROUVE: {
    label: 'Approuvée',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  SUSPENDU: {
    label: 'Suspendu',
    className: 'bg-brick-50 text-brick-600 ring-brick-300/60',
    dot: 'bg-brick-500',
  },
  SUPPRIME: {
    label: 'Supprimée',
    className: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  },
}

/** Badge de statut local à la page (les composants partagés ne sont pas modifiés). */
function BadgeStatutModeration({ status }) {
  const config = STATUTS_MODERATION[status] ?? {
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

export default function MesLogementsPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const { data, setData, loading, error, reload } = useApiResource(
    () => propertyService.listMesAnnonces({ page: currentPage, perPage: 50 }),
    [currentPage],
    { initialData: { items: [], meta: null } }
  )

  const logements = data.items
  const [aSupprimer, setASupprimer] = useState(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function confirmerSuppression() {
    setSuppressionEnCours(true)
    setActionError(null)
    try {
      await propertyService.remove(aSupprimer.id)
      setASupprimer(null)
      const actualise = await reload()

      if (currentPage > 1 && actualise?.meta) {
        const pageValide = Math.max(1, Math.min(currentPage, actualise.meta.last_page || 1))
        if (actualise.items.length === 0 || pageValide !== currentPage) {
          setCurrentPage(pageValide === currentPage ? currentPage - 1 : pageValide)
        }
      } else if (currentPage > 1 && actualise?.items?.length === 0) {
        setCurrentPage((page) => Math.max(1, page - 1))
      }
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSuppressionEnCours(false)
    }
  }

  async function changerStatut(logement, statut) {
    setActionError(null)
    try {
      const misAJour = await propertyService.updateStatut(logement.id, statut)
      setData((prev) => ({
        ...prev,
        items: prev.items.map((l) => (l.id === logement.id ? { ...l, statut: misAJour.statut } : l)),
      }))
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
              <Building2 className="h-5 w-5 text-gold-300" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                Espace propriétaire
              </p>
              <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
                Mes logements
              </h1>
              <p className="mt-1 text-sm text-ink-500">Gérez vos annonces, leur disponibilité et leur publication.</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 sm:justify-end">
            {data.meta && (
              <p className="text-sm text-ink-500">
                <span className="font-display text-lg font-bold text-brand-800">
                  {data.meta.total}
                </span>{' '}
                logement{data.meta.total > 1 ? 's' : ''}
              </p>
            )}
            <Link to="/proprietaire/logements/nouveau">
              <Button className="rounded-lg shadow-sm transition-all duration-150 hover:shadow focus:ring-gold-300/70">
                <Plus className="h-4 w-4" /> Ajouter un logement
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger vos annonces" message={error}>
            <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement de vos annonces…" className="rounded-xl border border-ink-100 bg-white py-12" />}

        {!loading && !error && logements.length === 0 && (
          <EmptyState
            icon={Building2}
            title="Vous n'avez pas encore de logement"
            description="Ajoutez votre premier logement pour commencer à recevoir des demandes."
            className="rounded-xl bg-white py-12"
            action={
              <Link to="/proprietaire/logements/nouveau">
                <Button className="rounded-lg shadow-sm">Ajouter un logement</Button>
              </Link>
            }
          />
        )}

        {!loading && logements.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {logements.map((l) => (
              <PropertyCard
                key={l.id}
                property={l}
                actions={
                  <div className="flex flex-col gap-3 border-t-2 border-gold-500/30 pt-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Publication</p>
                        <div className="mt-1.5"><BadgeStatutModeration status={l.statutModeration} /></div>
                        <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{AIDE_MODERATION[l.statutModeration]}</p>
                      </div>
                      <DropdownMenu
                        trigger={
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors duration-150 hover:bg-brand-50 hover:text-brand-700">
                            <MoreVertical className="h-4 w-4" />
                          </span>
                        }
                        items={[
                          {
                            label: 'Modifier',
                            icon: <Pencil className="h-4 w-4" />,
                            onClick: () => navigate(`/proprietaire/logements/${l.id}/modifier`),
                          },
                          {
                            label: 'Supprimer',
                            icon: <Trash2 className="h-4 w-4" />,
                            danger: true,
                            onClick: () => setASupprimer(l),
                          },
                        ]}
                      />
                    </div>

                    <Select
                      label="Disponibilité"
                      value={l.statut}
                      onChange={(e) => changerStatut(l, e.target.value)}
                    >
                      {STATUTS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                }
              />
            ))}
          </div>
        )}

        {!loading && !error && logements.length > 0 && data.meta && data.meta.last_page > 1 && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={data.meta.current_page <= 1 || suppressionEnCours}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <p className="rounded-full border border-ink-200 bg-white px-4 py-1 text-sm font-medium text-ink-700">
              Page {data.meta.current_page} sur {data.meta.last_page} — {data.meta.total} logement{data.meta.total > 1 ? 's' : ''} au total
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={data.meta.current_page >= data.meta.last_page || suppressionEnCours}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        title="Supprimer cette annonce ?"
        description={aSupprimer?.titre}
        className="rounded-xl border border-ink-100 shadow-2xl"
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setASupprimer(null)} disabled={suppressionEnCours}>
              Annuler
            </Button>
            <Button variant="danger" className="rounded-lg shadow-sm" onClick={confirmerSuppression} disabled={suppressionEnCours}>
              {suppressionEnCours ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-2.5 rounded-lg border border-gold-100 bg-gold-50/60 px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
          <p className="text-sm text-ink-700">
            Cette action est définitive. Les photos et les demandes associées à cette annonce seront
            également supprimées.
          </p>
        </div>
      </Dialog>
    </div>
  )
}
