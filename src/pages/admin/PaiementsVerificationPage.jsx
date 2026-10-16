import { useState } from 'react'
import { AlertTriangle, Check, ExternalLink, Wallet, X } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { financeService } from '@/services/financeService'
import { formatMoney, formatDate } from '@/lib/utils'

export default function PaiementsVerificationPage() {
  const { data: paiements, setData: setPaiements, loading, error, reload } = useApiResource(
    () => financeService.listPaiementsAVerifier(),
    [],
    { initialData: [] }
  )

  const [confirmation, setConfirmation] = useState(null) // { paiement, decision }
  const [actionEnCours, setActionEnCours] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function confirmer() {
    const { paiement, decision } = confirmation

    setActionEnCours(true)
    setActionError(null)
    try {
      await financeService.verifierPaiement(paiement.id, decision)
      setPaiements((prev) => prev.filter((p) => p.id !== paiement.id))
      setConfirmation(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionEnCours(false)
    }
  }

  return (
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
            <Wallet className="h-5 w-5 text-gold-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Administration
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
              Vérification des paiements
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Contrôlez la preuve fournie avant de valider. Une validation marque la facture comme payée
              et génère la quittance du locataire.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les paiements" message={error}>
            <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && !confirmation && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des paiements…" className="rounded-xl border border-ink-100 bg-white py-12" />}

        {!loading && !error && paiements.length === 0 && (
          <EmptyState
            icon={Wallet}
            title="Aucun paiement en attente"
            description="Tous les paiements déclarés ont été traités."
            className="rounded-xl bg-white py-12"
          />
        )}

        {paiements.length > 0 && (
        <div className="[&>div]:rounded-xl">
          <Table>
            <Thead className="border-b-2 border-gold-500/40 bg-white text-[11px] tracking-wider text-brand-800/90">
              <tr>
                <Th className="px-5 py-3.5">Locataire</Th>
                <Th className="px-5 py-3.5">Logement</Th>
                <Th className="px-5 py-3.5 text-right">Montant</Th>
                <Th className="px-5 py-3.5">Mode</Th>
                <Th className="px-5 py-3.5">Référence</Th>
                <Th className="px-5 py-3.5">Déclaré le</Th>
                <Th className="px-5 py-3.5">Preuve</Th>
                <Th className="px-5 py-3.5 text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <tbody>
              {paiements.map((p) => (
                <Tr key={p.id} className="transition-colors duration-150 hover:bg-brand-50/50">
                  <Td className="px-5 py-4 font-medium text-ink-900">{p.locataireNom}</Td>
                  <Td className="px-5 py-4">{p.logementTitre}</Td>
                  <Td className="px-5 py-4 text-right font-medium tabular-nums text-ink-900">{formatMoney(p.montant)}</Td>
                  <Td className="px-5 py-4">{p.mode}</Td>
                  <Td className="px-5 py-4 text-ink-500">{p.reference || '—'}</Td>
                  <Td className="whitespace-nowrap px-5 py-4">{formatDate(p.datePaiement)}</Td>
                  <Td className="px-5 py-4">
                    {p.preuveUrl ? (
                      <a
                        href={p.preuveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-brand-700 transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        Voir la preuve
                      </a>
                    ) : (
                      <span className="text-xs text-ink-400">Aucune</span>
                    )}
                  </Td>
                  <Td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="rounded-lg shadow-sm transition-all duration-150 hover:shadow"
                        onClick={() => setConfirmation({ paiement: p, decision: 'VALIDE' })}
                      >
                        <Check className="h-3.5 w-3.5" /> Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="rounded-lg shadow-sm transition-all duration-150 hover:shadow"
                        onClick={() => setConfirmation({ paiement: p, decision: 'REJETE' })}
                      >
                        <X className="h-3.5 w-3.5" /> Rejeter
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
        )}
      </div>

      <Dialog
        open={!!confirmation}
        onClose={() => setConfirmation(null)}
        className="rounded-xl border border-ink-100 shadow-2xl"
        title={confirmation?.decision === 'VALIDE' ? 'Valider ce paiement ?' : 'Rejeter ce paiement ?'}
        description={
          confirmation
            ? `${formatMoney(confirmation.paiement.montant)} — ${confirmation.paiement.locataireNom}`
            : ''
        }
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setConfirmation(null)} disabled={actionEnCours}>
              Annuler
            </Button>
            <Button
              variant={confirmation?.decision === 'VALIDE' ? 'primary' : 'danger'}
              className="rounded-lg shadow-sm"
              onClick={confirmer}
              disabled={actionEnCours}
            >
              {actionEnCours ? 'Traitement…' : confirmation?.decision === 'VALIDE' ? 'Valider' : 'Rejeter'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {actionError && <Alert message={actionError} />}

          <div className="flex items-start gap-2.5 rounded-lg border border-gold-100 bg-gold-50/60 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-ink-700">
              {confirmation?.decision === 'VALIDE'
                ? 'La facture sera marquée comme payée, une quittance sera générée et le locataire en sera notifié. Cette action est définitive.'
                : 'Le locataire sera notifié du rejet et devra déclarer à nouveau son paiement. Cette action est définitive.'}
            </p>
          </div>

          {confirmation?.paiement?.preuveUrl && (
            <a
              href={confirmation.paiement.preuveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Consulter la preuve de paiement
            </a>
          )}
        </div>
      </Dialog>
    </div>
  )
}
