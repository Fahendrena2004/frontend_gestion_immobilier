import { useState } from 'react'
import { Ban, Check, ShieldCheck, Trash2 } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { adminService } from '@/services/adminService'
import { formatMoney } from '@/lib/utils'

const FILTRES = [
  { value: '', label: 'Toutes les annonces' },
  { value: 'EN_ATTENTE', label: 'À modérer' },
  { value: 'APPROUVE', label: 'Approuvées' },
  { value: 'SUSPENDU', label: 'Suspendues' },
  { value: 'SUPPRIME', label: 'Supprimées' },
]

/** Action de modération -> statut qui en résulte. */
const RESULTAT_ACTION = {
  APPROUVER: 'APPROUVE',
  SUSPENDRE: 'SUSPENDU',
  SUPPRIMER: 'SUPPRIME',
}

export default function ModerationAnnoncesPage() {
  const [filtre, setFiltre] = useState('')

  const { data, setData, loading, error, reload } = useApiResource(
    () => adminService.listAnnonces({ statutModeration: filtre }),
    [filtre],
    { initialData: { items: [], meta: null } }
  )

  const annonces = data.items
  const [actionEnCours, setActionEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)

  async function moderer(id, action) {
    setActionEnCours(id)
    setActionError(null)
    try {
      await adminService.moderateAnnonce(id, action)
      const nouveauStatut = RESULTAT_ACTION[action]

      setData((prev) => ({
        ...prev,
        // Si un filtre est actif, l'annonce quitte la liste dès qu'elle n'y
        // correspond plus.
        items: filtre && filtre !== nouveauStatut
          ? prev.items.filter((a) => a.id !== id)
          : prev.items.map((a) => (a.id === id ? { ...a, statut: nouveauStatut } : a)),
      }))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Modération des annonces</h1>
          <p className="mt-1 text-sm text-ink-500">
            Seules les annonces approuvées apparaissent dans la recherche publique.
          </p>
        </div>
        <Select
          label="Filtrer"
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          className="sm:w-56"
        >
          {FILTRES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </Select>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les annonces" message={error}>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des annonces…" />}

        {!loading && !error && annonces.length === 0 && (
          <EmptyState
            icon={ShieldCheck}
            title="Aucune annonce à afficher"
            description={filtre ? 'Aucune annonce ne correspond à ce filtre.' : 'Aucune annonce publiée pour le moment.'}
          />
        )}

        {annonces.length > 0 && (
          <Table>
            <Thead>
              <tr>
                <Th>Logement</Th>
                <Th>Propriétaire</Th>
                <Th>Quartier</Th>
                <Th>Loyer</Th>
                <Th>Publication</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <tbody>
              {annonces.map((a) => {
                const enCours = actionEnCours === a.id
                return (
                  <Tr key={a.id}>
                    <Td className="font-medium text-ink-900">
                      {a.titre}
                      <span className="block text-xs font-normal text-ink-400">
                        {[a.type, a.pieces ? `${a.pieces} pièces` : null, a.surface ? `${a.surface} m²` : null,
                          `${a.nombrePhotos} photo${a.nombrePhotos > 1 ? 's' : ''}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </Td>
                    <Td>{a.proprietaireNom}</Td>
                    <Td>{a.quartier}</Td>
                    <Td>{formatMoney(a.prix)}</Td>
                    <Td><StatusBadge status={a.statut} /></Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        {a.statut !== 'APPROUVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={enCours}
                            onClick={() => moderer(a.id, 'APPROUVER')}
                          >
                            <Check className="h-3.5 w-3.5" /> Approuver
                          </Button>
                        )}
                        {a.statut !== 'SUSPENDU' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={enCours}
                            onClick={() => moderer(a.id, 'SUSPENDRE')}
                          >
                            <Ban className="h-3.5 w-3.5" /> Suspendre
                          </Button>
                        )}
                        {a.statut !== 'SUPPRIME' && (
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={enCours}
                            aria-label="Retirer l'annonce"
                            onClick={() => moderer(a.id, 'SUPPRIMER')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  )
}
