import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Check, CheckCircle2, ClipboardList, FileText, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState, { Spinner } from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { contractService } from '@/services/contractService'
import { cn, formatDate, formatMoney } from '@/lib/utils'

/** Statuts de demande réellement utilisés (DemandeStatus backend). */
const STATUTS_DEMANDE = {
  EN_ATTENTE: {
    label: 'En attente',
    className: 'bg-gold-50 text-gold-700 ring-gold-300/60',
    dot: 'bg-gold-500',
  },
  ACCEPTEE: {
    label: 'Acceptée',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  REFUSEE: {
    label: 'Refusée',
    className: 'bg-brick-50 text-brick-600 ring-brick-300/60',
    dot: 'bg-brick-500',
  },
  ANNULEE: {
    label: 'Annulée',
    className: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  },
}

/** Badge de statut local à la page (les composants partagés ne sont pas modifiés). */
function BadgeStatutDemande({ status }) {
  const config = STATUTS_DEMANDE[status] ?? {
    label: status ?? '—',
    className: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
        config.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  )
}

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
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
            <ClipboardList className="h-5 w-5 text-gold-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Espace propriétaire
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
              Demandes reçues
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Examinez les candidatures, puis établissez le contrat des demandes acceptées.
              Les visites se gèrent depuis la page{' '}
              <Link to="/proprietaire/visites" className="font-medium text-brand-700 hover:underline">
                Visites
              </Link>.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les demandes" message={error}>
            <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des demandes…" className="rounded-xl border border-ink-100 bg-white py-12" />}

        {!loading && !error && demandes.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="Aucune demande reçue"
            description="Les demandes envoyées par les locataires apparaîtront ici."
            className="rounded-xl bg-white py-12"
          />
        )}

        {demandes.map((d) => {
          const enCours = actionEnCours === d.id
          return (
            <Card key={d.id} className="rounded-xl transition-shadow duration-150 hover:shadow-md">
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <Avatar name={d.locataireNom} />
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-ink-900">{d.locataireNom}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-brand-400" aria-hidden="true" />
                      <span className="truncate">Pour : {d.logementTitre}</span>
                    </p>
                    {(d.locataireEmail || d.locataireTelephone) && (
                      <p className="mt-0.5 text-xs text-ink-400">
                        {[d.locataireEmail, d.locataireTelephone].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {d.message && (
                      <p className="mt-2 max-w-md whitespace-pre-line rounded-r-lg border-l-2 border-gold-500/50 bg-ink-50/70 py-2 pl-3 pr-3 text-sm leading-relaxed text-ink-700">
                        {d.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-ink-400">Reçue le {formatDate(d.dateEnvoi)}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2.5 sm:items-end">
                  <BadgeStatutDemande status={d.statut} />

                  {d.statut === 'EN_ATTENTE' && (
                    enCours ? (
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
                        <Spinner className="h-4 w-4 border-2" />
                        Traitement…
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <Button size="sm" className="rounded-lg shadow-sm transition-all duration-150 hover:shadow" disabled={enCours} onClick={() => repondre(d.id, 'ACCEPTEE')}>
                          <Check className="h-3.5 w-3.5" /> Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="rounded-lg shadow-sm transition-all duration-150 hover:shadow"
                          disabled={enCours}
                          onClick={() => repondre(d.id, 'REFUSEE')}
                        >
                          <X className="h-3.5 w-3.5" /> Refuser
                        </Button>
                      </div>
                    )
                  )}

                  {d.statut === 'ACCEPTEE' && !d.locationId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg transition-all duration-150 hover:border-brand-300 hover:text-brand-700"
                      onClick={() => ouvrirContrat(d)}
                    >
                      <FileText className="h-3.5 w-3.5" /> Créer le contrat
                    </Button>
                  )}

                  {d.statut === 'ACCEPTEE' && d.locationId && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Contrat déjà établi
                    </span>
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
        className="max-w-lg rounded-xl border border-ink-100 shadow-2xl"
        title="Créer le contrat de location"
        description={
          demandeContrat ? `Avec ${demandeContrat.locataireNom} — ${demandeContrat.logementTitre}` : ''
        }
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setDemandeContrat(null)} disabled={contratEnCours}>
              Annuler
            </Button>
            <Button className="rounded-lg shadow-sm" onClick={creerContrat} disabled={contratEnCours}>
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
