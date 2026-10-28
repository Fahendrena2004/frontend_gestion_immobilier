import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarRange, Download, ExternalLink, FileText, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState, { Spinner } from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { contractService } from '@/services/contractService'
import { financeService } from '@/services/financeService'
import { cn, formatMoney, formatDate } from '@/lib/utils'

/** Statuts de location, de facture et de paiement utilisés sur cette page. */
const STATUTS = {
  // Location (LocationStatus)
  EN_COURS: { label: 'En cours', className: 'bg-brand-50 text-brand-700 ring-brand-300/60', dot: 'bg-brand-500' },
  TERMINEE: { label: 'Terminée', className: 'bg-ink-100 text-ink-600 ring-ink-200', dot: 'bg-ink-400' },
  RENOUVELEE: { label: 'Renouvelée', className: 'bg-brand-50 text-brand-700 ring-brand-300/60', dot: 'bg-brand-500' },
  RESILIEE: { label: 'Résiliée', className: 'bg-brick-50 text-brick-600 ring-brick-300/60', dot: 'bg-brick-500' },
  // Facture (traduit par financeService)
  PAYEE: { label: 'Payée', className: 'bg-emerald-50 text-emerald-700 ring-emerald-300/60', dot: 'bg-emerald-500' },
  EN_ATTENTE: { label: 'À régler', className: 'bg-gold-50 text-gold-700 ring-gold-300/60', dot: 'bg-gold-500' },
  EN_RETARD: { label: 'En retard', className: 'bg-brick-50 text-brick-600 ring-brick-300/60', dot: 'bg-brick-500' },
  // Paiement (traduit par financeService)
  EN_ATTENTE_VERIFICATION: { label: 'À vérifier', className: 'bg-gold-50 text-gold-700 ring-gold-300/60', dot: 'bg-gold-500' },
  VALIDE: { label: 'Validé', className: 'bg-emerald-50 text-emerald-700 ring-emerald-300/60', dot: 'bg-emerald-500' },
  REJETE: { label: 'Rejeté', className: 'bg-brick-50 text-brick-600 ring-brick-300/60', dot: 'bg-brick-500' },
}

/** Badge de statut local à la page (les composants partagés ne sont pas modifiés). */
function BadgeStatut({ status }) {
  const config = STATUTS[status] ?? {
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

  if (loading) return <LoadingState label="Chargement de votre location…" className="rounded-xl border border-ink-100 bg-white py-12" />

  if (error) {
    return (
      <Alert title="Impossible de charger votre location" message={error} className="[&_button:focus]:ring-gold-300/70">
        <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
      </Alert>
    )
  }

  if (!location) {
    return (
      <EmptyState
        icon={Home}
        title="Aucune location active"
        description="Dès qu'une de vos demandes sera acceptée et votre contrat établi, votre location apparaîtra ici."
        className="rounded-xl bg-white py-12 [&_button:focus]:ring-gold-300/70"
        action={<Link to="/"><Button className="rounded-lg shadow-sm">Voir les logements</Button></Link>}
      />
    )
  }

  const { contrat, factures = [], paiements = [] } = location

  return (
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
            <Building2 className="h-5 w-5 text-gold-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Espace locataire
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
              Ma location
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {location.logementTitre}
              {location.quartier ? ` · ${location.quartier}, Fianarantsoa` : ''}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-xl lg:col-span-1">
          <CardHeader className="border-b-2 border-gold-500/30">
            <CardTitle className="flex items-center gap-2 text-brand-800">
              <FileText className="h-5 w-5 text-gold-600" /> Mon contrat
            </CardTitle>
            <BadgeStatut status={location.statut} />
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            {!contrat ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-ink-200 bg-ink-50/40 px-4 py-8 text-center">
                <FileText className="h-6 w-6 text-ink-300" aria-hidden="true" />
                <p className="text-ink-500">
                  Aucun contrat n'est encore rattaché à cette location.
                </p>
              </div>
            ) : (
              <>
                {/* Période */}
                <div className="rounded-lg border border-ink-100 bg-brand-50/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                    Période de location
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-900">
                    <CalendarRange className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    <span className="font-medium">{formatDate(contrat.dateDebut)}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
                    <span className="font-medium">
                      {contrat.dateFin ? formatDate(contrat.dateFin) : 'Non précisée'}
                    </span>
                  </div>
                </div>

                {/* Montants */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-ink-100 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Loyer mensuel</p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums text-brand-800">
                      {formatMoney(contrat.loyerMensuel)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-ink-100 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Caution</p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums text-brand-800">
                      {formatMoney(contrat.caution)}
                    </p>
                  </div>
                </div>

                {/* Parties et signature (données disponibles uniquement) */}
                {(location.locataireNom || contrat.dateSignature) && (
                  <dl className="flex flex-col gap-2">
                    {location.locataireNom && (
                      <Ligne label="Locataire" value={location.locataireNom} />
                    )}
                    {contrat.dateSignature && (
                      <Ligne label="Signé le" value={formatDate(contrat.dateSignature)} />
                    )}
                  </dl>
                )}

                {contrat.conditionsParticulieres && (
                  <div>
                    <p className="text-ink-500">Conditions particulières</p>
                    <p className="mt-1 whitespace-pre-line rounded-r-lg border-l-2 border-gold-500/50 bg-ink-50/70 p-3 text-xs text-ink-600">
                      {contrat.conditionsParticulieres}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full rounded-lg transition-all duration-150 hover:border-brand-300 hover:text-brand-700"
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

        <Card className="rounded-xl lg:col-span-2">
          <CardHeader className="border-b-2 border-gold-500/30">
            <CardTitle className="text-brand-800">Mes factures</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {factures.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-500">Aucune facture pour le moment.</p>
            ) : (
            <div className="[&>div]:rounded-xl">
              <Table>
                <Thead className="border-b-2 border-gold-500/40 bg-white text-[11px] tracking-wider text-brand-800/90">
                  <tr>
                    <Th className="px-5 py-3.5">Période</Th>
                    <Th className="px-5 py-3.5">Échéance</Th>
                    <Th className="px-5 py-3.5 text-right">Montant</Th>
                    <Th className="px-5 py-3.5">Statut</Th>
                    <Th className="px-5 py-3.5 text-right"><span className="sr-only">Actions</span></Th>
                  </tr>
                </Thead>
                <tbody>
                  {factures.map((f) => (
                    <Tr key={f.id} className="transition-colors duration-150 hover:bg-brand-50/50">
                      <Td className="px-5 py-4 font-medium text-ink-900">{f.periode}</Td>
                      <Td className={cn('whitespace-nowrap px-5 py-4', f.statut === 'EN_RETARD' && 'font-semibold text-brick-600')}>
                        {formatDate(f.echeance)}
                      </Td>
                      <Td className="px-5 py-4 text-right font-semibold tabular-nums text-brand-800">{formatMoney(f.montant)}</Td>
                      <Td className="px-5 py-4"><BadgeStatut status={f.statut} /></Td>
                      <Td className="px-5 py-4 text-right">
                        {(f.statut === 'EN_ATTENTE' || f.statut === 'EN_RETARD') && (
                          <Button size="sm" className="rounded-lg shadow-sm transition-all duration-150 hover:shadow" onClick={() => ouvrirPaiement(f)}>
                            Déclarer un paiement
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-brand-800">Historique des paiements</h2>
        <Card className="rounded-xl">
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
                    <BadgeStatut status={p.statut} />

                    {p.preuveUrl && (
                      <a
                        href={p.preuveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-brand-700 transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        Justificatif
                      </a>
                    )}

                    {p.statut === 'VALIDE' && p.quittanceId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg transition-all duration-150 hover:border-brand-300 hover:text-brand-700"
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
        className="rounded-xl border border-ink-100 shadow-2xl"
        title="Déclarer un paiement"
        description={
          factureAPayer ? `${factureAPayer.periode} · ${formatMoney(factureAPayer.montant)}` : ''
        }
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setFactureAPayer(null)} disabled={paiementEnCours}>
              Annuler
            </Button>
            <Button
              className="rounded-lg shadow-sm"
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
            <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-3 transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50/40">
              <input
                id="preuve"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setPayForm((f) => ({ ...f, preuve: e.target.files[0] || null }))}
                className="block w-full text-sm text-ink-500 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
              />
              <span className="mt-1.5 block text-xs text-ink-500">
                {payForm.preuve ? `Pièce jointe : ${payForm.preuve.name}` : 'Capture ou reçu — JPG, PNG ou PDF, 5 Mo maximum.'}
              </span>
            </div>
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
