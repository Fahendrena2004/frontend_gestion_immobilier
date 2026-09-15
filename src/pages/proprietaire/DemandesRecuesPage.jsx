import { useEffect, useState } from 'react'
import { ClipboardList, Check, X, CalendarPlus, FileText, Calendar, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { rentalService } from '@/services/rentalService'
import { contractService } from '@/services/contractService'
import { formatDate } from '@/lib/utils'

export default function DemandesRecuesPage() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [visiteDemande, setVisiteDemande] = useState(null)
  const [visiteDate, setVisiteDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [locationDemande, setLocationDemande] = useState(null)
  const [locationForm, setLocationForm] = useState({
    dateDebut: '',
    montantLoyer: '',
    montantCaution: '',
    conditions: '',
  })
  const [locationSaving, setLocationSaving] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [locationSuccess, setLocationSuccess] = useState(false)

  useEffect(() => {
    rentalService.listDemandesWithLocation().then((data) => {
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

  function openLocationDialog(demande) {
    setLocationDemande(demande)
    // Pré-remplir le loyer avec le prix du logement si disponible
    setLocationForm({
      dateDebut: new Date().toISOString().split('T')[0],
      montantLoyer: demande.logementPrix ? String(demande.logementPrix) : '',
      montantCaution: '',
      conditions: '',
    })
    setLocationError(null)
    setLocationSuccess(false)
  }

  async function handleCreateLocation(e) {
    e.preventDefault()
    if (!locationForm.dateDebut || !locationForm.montantLoyer) {
      setLocationError('La date de début et le loyer sont obligatoires')
      return
    }
    setLocationSaving(true)
    setLocationError(null)
    setLocationSuccess(false)
    try {
      await contractService.createLocation({
        demandeId: locationDemande.id,
        dateDebut: locationForm.dateDebut,
        montantLoyer: Number(locationForm.montantLoyer),
        montantCaution: locationForm.montantCaution ? Number(locationForm.montantCaution) : null,
        conditions: locationForm.conditions || null,
      })
      setLocationSuccess(true)
      // Rafraîchir la liste des demandes
      rentalService.listDemandesWithLocation().then((data) => setDemandes(data))
      setTimeout(() => {
        setLocationDemande(null)
        setLocationSaving(false)
      }, 1500)
    } catch (err) {
      setLocationError(err.message || 'Erreur lors de la création du contrat')
      setLocationSaving(false)
    }
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
                {d.statut === 'ACCEPTEE' && !d.locationId && (
                  <Button size="sm" variant="outline" onClick={() => openLocationDialog(d)}>
                    <FileText className="h-3.5 w-3.5" /> Créer le contrat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Proposer une visite */}
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

      {/* Dialog Créer le contrat de location */}
      <Dialog
        open={!!locationDemande}
        onClose={() => setLocationDemande(null)}
        title="Créer le contrat de location"
        description={locationDemande ? `Avec ${locationDemande.locataireNom} — ${locationDemande.logementTitre}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setLocationDemande(null)} disabled={locationSaving}>
              Annuler
            </Button>
            <Button onClick={handleCreateLocation} disabled={locationSaving}>
              {locationSaving ? 'Création…' : 'Créer le contrat'}
            </Button>
          </>
        }
      >
        {locationSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2" role="status">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-600">Contrat créé avec succès ! La page va se rafraîchir.</p>
          </div>
        )}
        {locationError && (
          <div className="mb-4 p-3 rounded-lg bg-brick-50 border border-brick-200 flex items-start gap-2" role="alert">
            <AlertCircle className="h-5 w-5 text-brick-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-brick-600">{locationError}</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Date de début du bail"
            type="date"
            value={locationForm.dateDebut}
            onChange={(e) => setLocationForm({ ...locationForm, dateDebut: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="Loyer mensuel (Ar)"
            type="number"
            min="0"
            step="1000"
            value={locationForm.montantLoyer}
            onChange={(e) => setLocationForm({ ...locationForm, montantLoyer: e.target.value })}
            required
          />
          <Input
            label="Caution (Ar) — optionnel"
            type="number"
            min="0"
            step="1000"
            value={locationForm.montantCaution}
            onChange={(e) => setLocationForm({ ...locationForm, montantCaution: e.target.value })}
          />
        </div>
        <Textarea
          label="Conditions particulières — optionnel"
          rows={4}
          value={locationForm.conditions}
          onChange={(e) => setLocationForm({ ...locationForm, conditions: e.target.value })}
          placeholder="Ex: charges comprises, animaux non admis, etc."
        />
      </Dialog>
    </div>
  )
}