import { useEffect, useState } from 'react'
import { Download, FileText, Home } from 'lucide-react'
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
            <Button variant="outline" size="sm" className="mt-2">
              <Download className="h-4 w-4" /> Télécharger le contrat (PDF)
            </Button>
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
                  {p.statut === 'VALIDE' && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-3.5 w-3.5" /> Quittance
                    </Button>
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
