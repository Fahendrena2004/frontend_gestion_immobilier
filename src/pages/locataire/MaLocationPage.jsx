import { useEffect, useState } from 'react'
import { Download, FileText, Home, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import { contractService } from '@/services/contractService'
import { financeService } from '@/services/financeService'
import { formatMoney, formatDate } from '@/lib/utils'

export default function MaLocationPage() {
  const [location, setLocation] = useState(null)
  const [modes, setModes] = useState([])
  const [dialogFacture, setDialogFacture] = useState(null)
  const [payForm, setPayForm] = useState({ mode: '', reference: '', preuve: null })
  const [submitting, setSubmitting] = useState(false)
  const [downloadState, setDownloadState] = useState({ type: null, loading: false, error: null })

  useEffect(() => {
    contractService.getMaLocationActive().then(setLocation)
    financeService.listModesPaiement().then(setModes)
  }, [])

  async function handleDeclarerPaiement() {
    setSubmitting(true)
    const paiement = await financeService.declarerPaiement({
      factureId: dialogFacture.id,
      montant: dialogFacture.montant,
      mode: payForm.mode,
      reference: payForm.reference,
      preuve: payForm.preuve,
    })
    setLocation((prev) => ({
      ...prev,
      factures: prev.factures.map((f) => (f.id === dialogFacture.id ? { ...f, statut: 'EN_ATTENTE_VERIFICATION' } : f)),
      paiements: [...prev.paiements, { ...paiement, statut: 'EN_ATTENTE_VERIFICATION' }],
    }))
    setSubmitting(false)
    setDialogFacture(null)
    setPayForm({ mode: '', reference: '', preuve: null })
  }

  async function handleDownloadContrat() {
    if (!location?.contrat?.id) return
    setDownloadState({ type: 'contrat', loading: true, error: null })
    try {
      const blob = await contractService.downloadContratPdf(location.contrat.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contrat-${location.contrat.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setDownloadState({ type: null, loading: false, error: null })
    } catch (err) {
      setDownloadState({ type: 'contrat', loading: false, error: err.message || 'Erreur lors du téléchargement du contrat' })
    }
  }

  async function handleDownloadQuittance(quittanceId) {
    if (!quittanceId) return
    setDownloadState({ type: 'quittance', loading: true, error: null })
    try {
      const blob = await financeService.downloadQuittance(quittanceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quittance-${quittanceId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setDownloadState({ type: null, loading: false, error: null })
    } catch (err) {
      setDownloadState({ type: 'quittance', loading: false, error: err.message || 'Erreur lors du téléchargement de la quittance' })
    }
  }

  if (!location) {
    return (
      <EmptyState
        icon={Home}
        title="Aucune location active"
        description="Dès qu'une de vos demandes sera acceptée et votre contrat signé, votre location apparaîtra ici."
      />
    )
  }

  const { contrat, factures, paiements } = location

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Ma location</h1>
      <p className="mt-1 text-sm text-ink-500">{location.logementTitre} · {location.quartier}, Fianarantsoa</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Mon contrat</CardTitle>
            <StatusBadge status={location.statut} />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Début" value={formatDate(contrat.dateDebut)} />
            <Row label="Fin" value={formatDate(contrat.dateFin)} />
            <Row label="Loyer mensuel" value={formatMoney(contrat.loyerMensuel)} />
            <Row label="Caution" value={formatMoney(contrat.caution)} />
            {contrat.conditionsParticulieres && (
              <p className="mt-1 rounded-md bg-ink-50 p-3 text-xs text-ink-600">{contrat.conditionsParticulieres}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleDownloadContrat}
              disabled={downloadState.loading}
            >
              {downloadState.type === 'contrat' && downloadState.loading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Télécharger le contrat (PDF)
                </>
              )}
            </Button>
            {downloadState.type === 'contrat' && downloadState.error && (
              <p className="text-xs text-brick-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {downloadState.error}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Mes factures</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <Thead>
                <tr>
                  <Th>Période</Th>
                  <Th>Échéance</Th>
                  <Th>Montant</Th>
                  <Th>Statut</Th>
                  <Th></Th>
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
                      {f.statut === 'EN_ATTENTE' && (
                        <Button size="sm" onClick={() => setDialogFacture(f)}>Déclarer un paiement</Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Historique des paiements</h2>
        <Card>
          <div className="divide-y divide-ink-100">
            {paiements.length === 0 && <p className="px-5 py-6 text-center text-sm text-ink-500">Aucun paiement déclaré.</p>}
            {paiements.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink-900">{formatMoney(p.montant)} · {p.mode}</p>
                  <p className="text-xs text-ink-500">Réf. {p.reference} · {formatDate(p.datePaiement)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.statut} />
                  {p.statut === 'VALIDE' && p.quittanceId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadQuittance(p.quittanceId)}
                      disabled={downloadState.type === 'quittance' && downloadState.loading}
                    >
                      {downloadState.type === 'quittance' && downloadState.loading ? (
                        <>
                          <svg className="mr-2 h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <FileText className="h-3.5 w-3.5" /> Quittance
                        </>
                      )}
                    </Button>
                  )}
                  {downloadState.type === 'quittance' && downloadState.error && (
                    <p className="text-xs text-brick-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {downloadState.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog
        open={!!dialogFacture}
        onClose={() => setDialogFacture(null)}
        title="Déclarer un paiement"
        description={dialogFacture ? `${dialogFacture.periode} · ${formatMoney(dialogFacture.montant)}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogFacture(null)}>Annuler</Button>
            <Button onClick={handleDeclarerPaiement} disabled={submitting || !payForm.mode || !payForm.reference || !payForm.preuve}>
              {submitting ? 'Envoi…' : 'Confirmer le paiement'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select label="Mode de paiement" value={payForm.mode} onChange={(e) => setPayForm((f) => ({ ...f, mode: e.target.value }))}>
            <option value="">Sélectionner un mode</option>
            {modes.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Input
            label="Référence de la transaction"
            placeholder="ex : MVOLA-88213"
            value={payForm.reference}
            onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))}
          />
          <div>
            <label className="text-sm font-medium text-ink-700">Preuve de paiement <span className="text-danger-600">*</span></label>
            <input type="file" required accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setPayForm((f) => ({ ...f, preuve: e.target.files[0] }))} className="mt-1.5 block w-full text-sm text-ink-500 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100" />
            {payForm.preuve && <p className="mt-1 text-xs text-ink-500">{payForm.preuve.name}</p>}
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  )
}
