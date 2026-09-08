import { useEffect, useState } from 'react'
import { ShieldCheck, Check, Ban, Trash2 } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { adminService } from '@/services/adminService'
import { formatMoney } from '@/lib/utils'

export default function ModerationAnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.listAnnonces().then((data) => {
      setAnnonces(data)
      setLoading(false)
    })
  }, [])

  async function handleAction(id, action, nextStatut) {
    await adminService.moderateAnnonce(id, action)
    if (nextStatut === 'SUPPRIME') {
      setAnnonces((prev) => prev.filter((a) => a.id !== id))
    } else {
      setAnnonces((prev) => prev.map((a) => (a.id === id ? { ...a, statut: nextStatut } : a)))
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Modération des annonces</h1>
      <p className="mt-1 text-sm text-ink-500">Vérifiez la conformité des logements publiés sur la plateforme.</p>

      <div className="mt-6">
        {!loading && annonces.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Aucune annonce à modérer" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Logement</Th>
                <Th>Propriétaire</Th>
                <Th>Quartier</Th>
                <Th>Prix</Th>
                <Th>Statut</Th>
                <Th></Th>
              </tr>
            </Thead>
            <tbody>
              {annonces.map((a) => (
                <Tr key={a.id}>
                  <Td className="font-medium text-ink-900">{a.titre}</Td>
                  <Td>{a.proprietaireNom}</Td>
                  <Td>{a.quartier}</Td>
                  <Td>{formatMoney(a.prix)}</Td>
                  <Td><StatusBadge status={a.statut} /></Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAction(a.id, 'APPROUVER', 'DISPONIBLE')}>
                        <Check className="h-3.5 w-3.5" /> Approuver
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(a.id, 'SUSPENDRE', 'INDISPONIBLE')}>
                        <Ban className="h-3.5 w-3.5" /> Suspendre
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleAction(a.id, 'SUPPRIMER', 'SUPPRIME')}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
