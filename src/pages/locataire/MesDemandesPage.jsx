import { useEffect, useState } from 'react'
import { FileX2, FileText } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { rentalService } from '@/services/rentalService'
import { formatDate } from '@/lib/utils'

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rentalService.listDemandes().then((data) => {
      setDemandes(data)
      setLoading(false)
    })
  }, [])

  async function handleCancel(id) {
    const updated = await rentalService.cancelDemande(id)
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut: updated.statut } : d)))
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Mes demandes de location</h1>
      <p className="mt-1 text-sm text-ink-500">Suivez le statut de vos demandes envoyées aux propriétaires.</p>

      <div className="mt-6">
        {!loading && demandes.length === 0 ? (
          <EmptyState icon={FileX2} title="Aucune demande envoyée" description="Parcourez les logements disponibles pour envoyer votre première demande." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Logement</Th>
                <Th>Message</Th>
                <Th>Date d'envoi</Th>
                <Th>Statut</Th>
                <Th></Th>
              </tr>
            </Thead>
            <tbody>
              {demandes.map((d) => (
                <Tr key={d.id}>
                  <Td className="font-medium text-ink-900">{d.logementTitre}</Td>
                  <Td className="max-w-xs truncate text-ink-500">{d.message}</Td>
                  <Td>{formatDate(d.dateEnvoi)}</Td>
                  <Td><StatusBadge status={d.statut} /></Td>
                  <Td>
                    {d.statut === 'EN_ATTENTE' && (
                      <Button variant="outline" size="sm" onClick={() => handleCancel(d.id)}>
                        Annuler
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
