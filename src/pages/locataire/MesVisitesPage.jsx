import { useEffect, useState } from 'react'
import { CalendarX2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { rentalService } from '@/services/rentalService'
import { formatDateTime } from '@/lib/utils'

export default function MesVisitesPage() {
  const [visites, setVisites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rentalService.listVisites().then((data) => {
      setVisites(data)
      setLoading(false)
    })
  }, [])

  async function handleConfirm(id) {
    const updated = await rentalService.confirmerVisite(id)
    setVisites((prev) => prev.map((v) => (v.id === id ? { ...v, statut: updated.statut } : v)))
  }

  async function handleCancel(id) {
    const updated = await rentalService.annulerVisite(id)
    setVisites((prev) => prev.map((v) => (v.id === id ? { ...v, statut: updated.statut } : v)))
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Mes visites</h1>
      <p className="mt-1 text-sm text-ink-500">Confirmez ou annulez les visites proposées par les propriétaires.</p>

      <div className="mt-6 flex flex-col gap-4">
        {!loading && visites.length === 0 && (
          <EmptyState icon={CalendarX2} title="Aucune visite planifiée" description="Vos demandes de visite apparaîtront ici." />
        )}
        {visites.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-base font-semibold text-ink-900">{v.logementTitre}</p>
                <p className="text-sm text-ink-500">{formatDateTime(v.dateProposee)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={v.statut} />
                {v.statut === 'PROPOSEE' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleConfirm(v.id)}>Confirmer</Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel(v.id)}>Annuler</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
