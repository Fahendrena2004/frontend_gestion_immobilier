import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileX2 } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { formatDate } from '@/lib/utils'

export default function MesDemandesPage() {
  const { data: demandes, setData: setDemandes, loading, error, reload } = useApiResource(
    () => rentalService.listDemandes(),
    [],
    { initialData: [] }
  )

  const [annulationEnCours, setAnnulationEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)

  async function handleCancel(id) {
    setAnnulationEnCours(id)
    setActionError(null)
    try {
      const misAJour = await rentalService.cancelDemande(id)
      setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut: misAJour.statut } : d)))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setAnnulationEnCours(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Mes demandes de location</h1>
      <p className="mt-1 text-sm text-ink-500">Suivez le statut de vos demandes envoyées aux propriétaires.</p>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger vos demandes" message={error}>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement de vos demandes…" />}

        {!loading && !error && demandes.length === 0 && (
          <EmptyState
            icon={FileX2}
            title="Aucune demande envoyée"
            description="Parcourez les logements disponibles pour envoyer votre première demande."
            action={<Link to="/"><Button>Voir les logements</Button></Link>}
          />
        )}

        {demandes.length > 0 && (
          <Table>
            <Thead>
              <tr>
                <Th>Logement</Th>
                <Th>Message</Th>
                <Th>Date d'envoi</Th>
                <Th>Statut</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <tbody>
              {demandes.map((d) => (
                <Tr key={d.id}>
                  <Td className="font-medium text-ink-900">{d.logementTitre}</Td>
                  <Td className="max-w-xs truncate text-ink-500">{d.message || '—'}</Td>
                  <Td>{formatDate(d.dateEnvoi)}</Td>
                  <Td><StatusBadge status={d.statut} /></Td>
                  <Td>
                    {d.statut === 'EN_ATTENTE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={annulationEnCours === d.id}
                        onClick={() => handleCancel(d.id)}
                      >
                        {annulationEnCours === d.id ? 'Annulation…' : 'Annuler'}
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  )
}
