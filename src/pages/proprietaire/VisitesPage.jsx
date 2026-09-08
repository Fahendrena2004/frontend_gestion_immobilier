import { useEffect, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { rentalService } from '@/services/rentalService'
import { formatDateTime } from '@/lib/utils'

export default function VisitesPage() {
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

  async function handleResultat(id, resultat) {
    await rentalService.renseignerResultat(id, resultat)
    setVisites((prev) => prev.map((v) => (v.id === id ? { ...v, resultat } : v)))
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Visites</h1>
      <p className="mt-1 text-sm text-ink-500">Gérez le planning de vos visites et enregistrez leur issue.</p>

      <div className="mt-6 flex flex-col gap-4">
        {!loading && visites.length === 0 && (
          <EmptyState icon={CalendarCheck} title="Aucune visite planifiée" description="Proposez une visite depuis une demande reçue." />
        )}
        {visites.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-base font-semibold text-ink-900">{v.logementTitre}</p>
                <p className="text-sm text-ink-500">{formatDateTime(v.dateProposee)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={v.statut} />
                {v.statut === 'PROPOSEE' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleConfirm(v.id)}>Confirmer</Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel(v.id)}>Annuler</Button>
                  </div>
                )}
                {v.statut === 'CONFIRMEE' && !v.resultat && (
                  <Select
                    className="w-48"
                    defaultValue=""
                    onChange={(e) => e.target.value && handleResultat(v.id, e.target.value)}
                  >
                    <option value="" disabled>Renseigner le résultat</option>
                    <option value="CONCLUANTE">Concluante</option>
                    <option value="NON_CONCLUANTE">Non concluante</option>
                  </Select>
                )}
                {v.resultat && <StatusBadge status={v.resultat} />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
