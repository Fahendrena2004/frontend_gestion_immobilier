import { useEffect, useState } from 'react'
import { ClipboardList, Check, X, CalendarPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { rentalService } from '@/services/rentalService'
import { formatDate } from '@/lib/utils'

export default function DemandesRecuesPage() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [visiteDemande, setVisiteDemande] = useState(null)
  const [visiteDate, setVisiteDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    rentalService.listDemandes().then((data) => {
      setDemandes(data)
      setLoading(false)
    })
  }, [])

  async function handleRespond(id, decision) {
    const updated = await rentalService.respondDemande(id, decision)
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut: updated.statut } : d)))
  }

  async function handleProposerVisite() {
    setSaving(true)
    await rentalService.proposerVisite(visiteDemande.id, visiteDate)
    setSaving(false)
    setVisiteDemande(null)
    setVisiteDate('')
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Demandes reçues</h1>
      <p className="mt-1 text-sm text-ink-500">Examinez les candidatures et organisez les visites de vos logements.</p>

      <div className="mt-6 flex flex-col gap-4">
        {!loading && demandes.length === 0 && (
          <EmptyState icon={ClipboardList} title="Aucune demande reçue" description="Les demandes envoyées par les locataires apparaîtront ici." />
        )}
        {demandes.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <Avatar name={d.locataireNom} />
                <div>
                  <p className="font-display text-base font-semibold text-ink-900">{d.locataireNom}</p>
                  <p className="text-sm text-ink-500">Pour : {d.logementTitre}</p>
                  <p className="mt-2 max-w-md text-sm text-ink-600">{d.message}</p>
                  <p className="mt-1 text-xs text-ink-400">Reçue le {formatDate(d.dateEnvoi)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={d.statut} />
                {d.statut === 'EN_ATTENTE' && (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setVisiteDemande(d)}>
                      <CalendarPlus className="h-3.5 w-3.5" /> Proposer une visite
                    </Button>
                    <Button size="sm" onClick={() => handleRespond(d.id, 'ACCEPTEE')}>
                      <Check className="h-3.5 w-3.5" /> Accepter
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleRespond(d.id, 'REFUSEE')}>
                      <X className="h-3.5 w-3.5" /> Refuser
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!visiteDemande}
        onClose={() => setVisiteDemande(null)}
        title="Proposer une visite"
        description={visiteDemande ? `Avec ${visiteDemande.locataireNom} — ${visiteDemande.logementTitre}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setVisiteDemande(null)}>Annuler</Button>
            <Button onClick={handleProposerVisite} disabled={saving || !visiteDate}>
              {saving ? 'Envoi…' : 'Proposer cette date'}
            </Button>
          </>
        }
      >
        <Input
          label="Date et heure proposées"
          type="datetime-local"
          value={visiteDate}
          onChange={(e) => setVisiteDate(e.target.value)}
        />
      </Dialog>
    </div>
  )
}
