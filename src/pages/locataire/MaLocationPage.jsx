import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileText, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState, { Spinner } from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { contractService } from '@/services/contractService'
import { financeService } from '@/services/financeService'
import { formatMoney, formatDate } from '@/lib/utils'

/** Déclenche le téléchargement d'un blob renvoyé par l'API. */
function telechargerBlob(blob, nomFichier) {
  const url = window.URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  window.URL.revokeObjectURL(url)
}

export default function MaLocationPage() {
  const { data: location, loading, error, reload } = useApiResource(
    () => contractService.getMaLocationActive(),
    []
  )

  const [modes, setModes] = useState([])
  const [modesErreur, setModesErreur] = useState(null)

  const [factureAPayer, setFactureAPayer] = useState(null)
  const [payForm, setPayForm] = useState({ modeId: '', reference: '', preuve: null })
  const [paiementEnCours, setPaiementEnCours] = useState(false)
  const [paiementErreur, setPaiementErreur] = useState(null)

  // { cle: 'contrat' | `quittance-3`, erreur: string|null }
  const [telechargement, setTelechargement] = useState({ cle: null, erreur: null })

  useEffect(() => {
    financeService
      .listModesPaiement()
      .then(setModes)
      .catch((err) => setModesErreur(err.message))
  }, [])

  function ouvrirPaiement(facture) {
    setFactureAPayer(facture)
    setPayForm({ modeId: '', reference: '', preuve: null })
    setPaiementErreur(null)
  }

  async function handleDeclarerPaiement() {
    setPaiementEnCours(true)
    setPaiementErreur(null)
    try {
      await financeService.declarerPaiement({
        factureId: factureAPayer.id,
        montant: factureAPayer.montant,
        modeId: payForm.modeId,
        reference: payForm.reference,
        preuve: payForm.preuve,
      })
      setFactureAPayer(null)
      // On recharge depuis l'API : le statut de la facture et la liste des
      // paiements sont calculés côté serveur.
      await reload()
    } catch (err) {
      setPaiementErreur(err.message)
    } finally {
      setPaiementEnCours(false)
    }
  }

  async function handleTelecharger(cle, chargement, nomFichier) {
    setTelechargement({ cle, erreur: null })
    try {
      telechargerBlob(await chargement(), nomFichier)
      setTelechargement({ cle: null, erreur: null })
    } catch (err) {
      setTelechargement({ cle, erreur: err.message || 'Téléchargement impossible.' })
    }
  }

  if (loading) return <LoadingState label="Chargement de votre location…" />

  if (error) {
    return (
      <Alert title="Impossible de charger votre location" message={error}>
        <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
      </Alert>
    )
  }

  if (!location) {
    return (
      <EmptyState
        icon={Home}
        title="Aucune location active"
        description="Dès qu'une de vos demandes sera acceptée et votre contrat établi, votre location apparaîtra ici."
        action={<Link to="/"><Button>Voir les logements</Button></Link>}
      />
    )
  }

  const { contrat, factures = [], paiements = [] } = location

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Ma location</h1>
      <p className="mt-1 text-sm text-ink-500">
        {location.logementTitre}
        {location.quartier ? ` · ${location.quartier}, Fianarantsoa` : ''}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Mon contrat</CardTitle>
            <StatusBadge status={location.statut} />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {!contrat ? (
              <p className="text-ink-500">
                Aucun contrat n'est encore rattaché à cette location.
              </p>
            ) : (
              <>
                <Ligne label="Début" value={formatDate(contrat.dateDebut)} />
                <Ligne label="Fin" value={contrat.dateFin ? formatDate(contrat.dateFin) : 'Non précisée'} />
                <Ligne label="Loyer mensuel" value={formatMoney(contrat.loyerMensuel)} />
                <Ligne label="Caution" value={formatMoney(contrat.caution)} />

                {contrat.conditionsParticulieres && (
                  <div>
                    <p className="text-ink-500">Conditions particulières</p>
                    <p className="mt-1 whitespace-pre-line rounded-md bg-ink-50 p-3 text-xs text-ink-600">
                      {contrat.conditionsParticulieres}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  disabled={telechargement.cle === 'contrat' && !telechargement.erreur}
                  onClick={() =>
                    handleTelecharger(
                      'contrat',
                      () => contractService.downloadContratPdf(location.id),
                      `contrat-${location.id}.pdf`
                    )
                  }
                >
                  {telechargement.cle === 'contrat' && !telechargement.erreur ? (
                    <><Spinner className="h-4 w-4" /> Téléchargement…</>
                  ) : (
                    <><Download className="h-4 w-4" /> Télécharger le contrat (PDF)</>
                  )}
                </Button>

                {telechargement.cle === 'contrat' && telechargement.erreur && (
                  <Alert message={telechargement.erreur} />
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Mes factures</CardTitle></CardHeader>
          <CardContent className="p-0">
            {factures.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-500">Aucune facture pour le moment.</p>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>Période</Th>
                    <Th>Échéance</Th>
                    <Th>Montant</Th>
                    <Th>Statut</Th>
                    <Th><span className="sr-only">Actions</span></Th>
                  </tr>
                </Thead>
                <tbody>
                  {factures.map((f) => (
                    <Tr key={f.id}>
                      <Td className="font-medium text-ink-900">{f.periode}</Td>
                      <Td>{formatDate(f.echeance)}</Td>
                      <Td>{formatMoney(f.montant)}</Td>
                      <Td><StatusBadge status={f.statut} /></Td>
                      <Td>
                        {(f.statut === 'EN_ATTENTE' || f.statut === 'EN_RETARD') && (
                          <Button size="sm" onClick={() => ouvrirPaiement(f)}>Déclarer un paiement</Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Historique des paiements</h2>
        <Card>
          <div className="divide-y divide-ink-100">
            {paiements.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-ink-500">Aucun paiement déclaré.</p>
            )}
            {paiements.map((p) => {
              const cleQuittance = `quittance-${p.quittanceId}`
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {formatMoney(p.montant)}{p.mode ? ` · ${p.mode}` : ''}
                    </p>
                    <p className="text-xs text-ink-500">
                      {p.reference ? `Réf. ${p.reference} · ` : ''}{formatDate(p.datePaiement)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={p.statut} />

                    {p.statut === 'VALIDE' && p.quittanceId && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={telechargement.cle === cleQuittance && !telechargement.erreur}
                        onClick={() =>
                          handleTelecharger(
                            cleQuittance,
                            () => financeService.downloadQuittance(p.quittanceId),
                            `quittance-${p.quittanceNumero || p.quittanceId}.pdf`
                          )
                        }
                      >
                        {telechargement.cle === cleQuittance && !telechargement.erreur ? (
                          <><Spinner className="h-3.5 w-3.5" /> Téléchargement…</>
                        ) : (
                          <><FileText className="h-3.5 w-3.5" /> Quittance</>
                        )}
                      </Button>
                    )}

                    {telechargement.cle === cleQuittance && telechargement.erreur && (
                      <Alert message={telechargement.erreur} className="w-full" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Dialog
        open={!!factureAPayer}
        onClose={() => setFactureAPayer(null)}
        title="Déclarer un paiement"
        description={
          factureAPayer ? `${factureAPayer.periode} · ${formatMoney(factureAPayer.montant)}` : ''
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setFactureAPayer(null)} disabled={paiementEnCours}>
              Annuler
            </Button>
            <Button
              onClick={handleDeclarerPaiement}
              disabled={paiementEnCours || !payForm.modeId || !payForm.preuve}
            >
              {paiementEnCours ? 'Envoi…' : 'Confirmer le paiement'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {paiementErreur && <Alert message={paiementErreur} />}
          {modesErreur && <Alert message={`Modes de paiement indisponibles : ${modesErreur}`} />}

          <Select
            label="Mode de paiement *"
            value={payForm.modeId}
            onChange={(e) => setPayForm((f) => ({ ...f, modeId: e.target.value }))}
          >
            <option value="">Sélectionner un mode</option>
            {modes.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}
          </Select>

          <Input
            label="Référence de la transaction"
            placeholder="ex : MVOLA-88213"
            value={payForm.reference}
            onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="preuve" className="text-sm font-medium text-ink-700">
              Preuve de paiement *
            </label>
            <input
              id="preuve"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setPayForm((f) => ({ ...f, preuve: e.target.files[0] || null }))}
              className="block w-full text-sm text-ink-500 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
            />
            <span className="text-xs text-ink-500">
              {payForm.preuve ? payForm.preuve.name : 'Capture ou reçu — JPG, PNG ou PDF, 5 Mo maximum.'}
            </span>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function Ligne({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  )
}
