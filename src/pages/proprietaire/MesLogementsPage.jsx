import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import PropertyCard from '@/components/shared/PropertyCard'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import DropdownMenu from '@/components/ui/DropdownMenu'
import useApiResource from '@/hooks/useApiResource'
import { propertyService } from '@/services/propertyService'

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

export default function MesLogementsPage() {
  const navigate = useNavigate()

  const { data, setData, loading, error, reload } = useApiResource(
    () => propertyService.listMesAnnonces(),
    [],
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
      setData((prev) => ({ ...prev, items: prev.items.filter((l) => l.id !== aSupprimer.id) }))
      setASupprimer(null)
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
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Mes logements</h1>
          <p className="mt-1 text-sm text-ink-500">Gérez vos annonces, leur disponibilité et leur publication.</p>
        </div>
        <Link to="/proprietaire/logements/nouveau">
          <Button><Plus className="h-4 w-4" /> Ajouter un logement</Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger vos annonces" message={error}>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement de vos annonces…" />}

        {!loading && !error && logements.length === 0 && (
          <EmptyState
            icon={Building2}
            title="Vous n'avez pas encore de logement"
            description="Ajoutez votre premier logement pour commencer à recevoir des demandes."
            action={
              <Link to="/proprietaire/logements/nouveau">
                <Button>Ajouter un logement</Button>
              </Link>
            }
          />
        )}

        {logements.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {logements.map((l) => (
              <PropertyCard
                key={l.id}
                property={l}
                actions={
                  <div className="flex flex-col gap-3 border-t border-ink-100 pt-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink-500">Publication</p>
                        <div className="mt-1"><StatusBadge status={l.statutModeration} /></div>
                        <p className="mt-1 text-xs text-ink-400">{AIDE_MODERATION[l.statutModeration]}</p>
                      </div>
                      <DropdownMenu
                        trigger={
                          <span className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100">
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
      </div>

      <Dialog
        open={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        title="Supprimer cette annonce ?"
        description={aSupprimer?.titre}
        footer={
          <>
            <Button variant="outline" onClick={() => setASupprimer(null)} disabled={suppressionEnCours}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmerSuppression} disabled={suppressionEnCours}>
              {suppressionEnCours ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          Cette action est définitive. Les photos et les demandes associées à cette annonce seront
          également supprimées.
        </p>
      </Dialog>
    </div>
  )
}
