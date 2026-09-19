import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ClipboardList, FileText, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { contractService } from '@/services/contractService'
import { formatDate, formatMoney } from '@/lib/utils'

function aujourdhui() {
  return new Date().toISOString().split('T')[0]
}

export default function DemandesRecuesPage() {
  const { data: demandes, setData: setDemandes, loading, error, reload } = useApiResource(
    () => rentalService.listDemandesWithLocation(),
    [],
    { initialData: [] }
  )

  const [actionEnCours, setActionEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)

  // Création du contrat de location
  const [demandeContrat, setDemandeContrat] = useState(null)
  const [contratForm, setContratForm] = useState({
    dateDebut: '',
    montantLoyer: '',
    montantCaution: '',
    conditions: '',
  })
  const [contratEnCours, setContratEnCours] = useState(false)
  const [contratErreur, setContratErreur] = useState(null)

  async function repondre(id, decision) {
    setActionEnCours(id)
    setActionError(null)
    try {
      const misAJour = await rentalService.respondDemande(id, decision)
      setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut: misAJour.statut } : d)))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  function ouvrirContrat(demande) {
    setDemandeContrat(demande)
    setContratForm({
      dateDebut: aujourdhui(),
      montantLoyer: demande.logementPrix != null ? String(demande.logementPrix) : '',
      montantCaution: demande.logementCaution != null ? String(demande.logementCaution) : '',
      conditions: '',
    })
    setContratErreur(null)
  }

  async function creerContrat(e) {
    e.preventDefault()

    if (!contratForm.dateDebut || !contratForm.montantLoyer) {
      setContratErreur('La date de début et le loyer sont obligatoires.')
      return
    }

    setContratEnCours(true)
    setContratErreur(null)
    try {
      await contractService.createLocation({
        demandeId: demandeContrat.id,
        dateDebut: contratForm.dateDebut,
        montantLoyer: Number(contratForm.montantLoyer),
        montantCaution: contratForm.montantCaution ? Number(contratForm.montantCaution) : null,
        conditions: contratForm.conditions || null,
      })
      setDemandeContrat(null)
      // Le serveur a créé la location, passé le logement en « loué » et généré
      // la première facture : on recharge pour refléter cet état.
      await reload()
    } catch (err) {
      setContratErreur(err.message)
    } finally {
      setContratEnCours(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Demandes reçues</h1>
      <p className="mt-1 text-sm text-ink-500">
        Examinez les candidatures, puis établissez le contrat des demandes acceptées.
        Les visites se gèrent depuis la page{' '}
        <Link to="/proprietaire/visites" className="font-medium text-brand-700 hover:underline">
          Visites
        </Link>.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les demandes" message={error}>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des demandes…" />}

        {!loading && !error && demandes.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="Aucune demande reçue"
            description="Les demandes envoyées par les locataires apparaîtront ici."
          />
        )}

        {demandes.map((d) => {
          const enCours = actionEnCours === d.id
          return (
            <Card key={d.id}>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <Avatar name={d.locataireNom} />
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-ink-900">{d.locataireNom}</p>
                    <p className="text-sm text-ink-500">Pour : {d.logementTitre}</p>
                    {(d.locataireEmail || d.locataireTelephone) && (
                      <p className="text-xs text-ink-400">
                        {[d.locataireEmail, d.locataireTelephone].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {d.message && (
                      <p className="mt-2 max-w-md whitespace-pre-line text-sm text-ink-600">{d.message}</p>
                    )}
                    <p className="mt-1 text-xs text-ink-400">Reçue le {formatDate(d.dateEnvoi)}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <StatusBadge status={d.statut} />

                  {d.statut === 'EN_ATTENTE' && (
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Button size="sm" disabled={enCours} onClick={() => repondre(d.id, 'ACCEPTEE')}>
                        <Check className="h-3.5 w-3.5" /> Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={enCours}
                        onClick={() => repondre(d.id, 'REFUSEE')}
                      >
                        <X className="h-3.5 w-3.5" /> Refuser
                      </Button>
                    </div>
                  )}

                  {d.statut === 'ACCEPTEE' && !d.locationId && (
                    <Button size="sm" variant="outline" onClick={() => ouvrirContrat(d)}>
                      <FileText className="h-3.5 w-3.5" /> Créer le contrat
                    </Button>
                  )}

                  {d.statut === 'ACCEPTEE' && d.locationId && (
                    <span className="text-xs text-ink-500">Contrat déjà établi</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog
        open={!!demandeContrat}
        onClose={() => setDemandeContrat(null)}
        className="max-w-lg"
        title="Créer le contrat de location"
        description={
          demandeContrat ? `Avec ${demandeContrat.locataireNom} — ${demandeContrat.logementTitre}` : ''
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setDemandeContrat(null)} disabled={contratEnCours}>
              Annuler
            </Button>
            <Button onClick={creerContrat} disabled={contratEnCours}>
              {contratEnCours ? 'Création…' : 'Créer le contrat'}
            </Button>
          </>
        }
      >
        <form onSubmit={creerContrat} className="flex flex-col gap-4">
          {contratErreur && <Alert message={contratErreur} />}

          <Alert
            variant="info"
            message="La création du contrat passe le logement en « loué » et génère automatiquement la première facture du locataire."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Date de début du bail *"
              type="date"
              required
              min={aujourdhui()}
              value={contratForm.dateDebut}
              onChange={(e) => setContratForm({ ...contratForm, dateDebut: e.target.value })}
            />
            <Input
              label="Loyer mensuel (Ar) *"
              type="number"
              min="0"
              step="1000"
              required
              value={contratForm.montantLoyer}
              onChange={(e) => setContratForm({ ...contratForm, montantLoyer: e.target.value })}
              hint={
                demandeContrat?.logementPrix != null
                  ? `Loyer de l'annonce : ${formatMoney(demandeContrat.logementPrix)}`
                  : undefined
              }
            />
          </div>

          <Input
            label="Caution (Ar)"
            type="number"
            min="0"
            step="1000"
            value={contratForm.montantCaution}
            onChange={(e) => setContratForm({ ...contratForm, montantCaution: e.target.value })}
          />

          <Textarea
            label="Conditions particulières"
            rows={4}
            value={contratForm.conditions}
            onChange={(e) => setContratForm({ ...contratForm, conditions: e.target.value })}
            placeholder="ex : charges comprises, animaux non admis…"
          />
        </form>
      </Dialog>
    </div>
  )
}
