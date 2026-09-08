import { useEffect, useState } from 'react'
import { Wallet, Check, X } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import { financeService } from '@/services/financeService'
import { formatMoney, formatDate } from '@/lib/utils'

export default function PaiementsVerificationPage() {
  const [paiements, setPaiements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    financeService.listPaiementsAVerifier().then((data) => {
      setPaiements(data)
      setLoading(false)
    })
  }, [])

  async function handleVerify(id, decision) {
    await financeService.verifierPaiement(id, decision)
    setPaiements((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Vérification des paiements</h1>
      <p className="mt-1 text-sm text-ink-500">Validez ou rejetez les paiements déclarés par les locataires.</p>

      <div className="mt-6">
        {!loading && paiements.length === 0 ? (
          <EmptyState icon={Wallet} title="Aucun paiement en attente" description="Tous les paiements déclarés ont été traités." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Locataire</Th>
                <Th>Logement</Th>
                <Th>Montant</Th>
                <Th>Mode</Th>
                <Th>Référence</Th>
                <Th>Date</Th>
                <Th></Th>
              </tr>
            </Thead>
            <tbody>
              {paiements.map((p) => (
                <Tr key={p.id}>
                  <Td className="font-medium text-ink-900">{p.locataireNom}</Td>
                  <Td>{p.logement}</Td>
                  <Td>{formatMoney(p.montant)}</Td>
                  <Td>{p.mode}</Td>
                  <Td className="text-ink-500">{p.reference}</Td>
                  <Td>{formatDate(p.datePaiement)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleVerify(p.id, 'VALIDE')}>
                        <Check className="h-3.5 w-3.5" /> Valider
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleVerify(p.id, 'REJETE')}>
                        <X className="h-3.5 w-3.5" /> Rejeter
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
