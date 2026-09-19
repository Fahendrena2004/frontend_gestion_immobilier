import { useState } from 'react'
import { Check, ExternalLink, Wallet, X } from 'lucide-react'
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
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Vérification des paiements</h1>
      <p className="mt-1 text-sm text-ink-500">
        Contrôlez la preuve fournie avant de valider. Une validation marque la facture comme payée
        et génère la quittance du locataire.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les paiements" message={error}>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && !confirmation && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des paiements…" />}

        {!loading && !error && paiements.length === 0 && (
          <EmptyState
            icon={Wallet}
            title="Aucun paiement en attente"
            description="Tous les paiements déclarés ont été traités."
          />
        )}

        {paiements.length > 0 && (
          <Table>
            <Thead>
              <tr>
                <Th>Locataire</Th>
                <Th>Logement</Th>
                <Th>Montant</Th>
                <Th>Mode</Th>
                <Th>Référence</Th>
                <Th>Déclaré le</Th>
                <Th>Preuve</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <tbody>
              {paiements.map((p) => (
                <Tr key={p.id}>
                  <Td className="font-medium text-ink-900">{p.locataireNom}</Td>
                  <Td>{p.logementTitre}</Td>
                  <Td>{formatMoney(p.montant)}</Td>
                  <Td>{p.mode}</Td>
                  <Td className="text-ink-500">{p.reference || '—'}</Td>
                  <Td>{formatDate(p.datePaiement)}</Td>
                  <Td>
                    {p.preuveUrl ? (
                      <a
                        href={p.preuveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                      >
                        Voir <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-ink-400">Aucune</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setConfirmation({ paiement: p, decision: 'VALIDE' })}>
                        <Check className="h-3.5 w-3.5" /> Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
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
        )}
      </div>

      <Dialog
        open={!!confirmation}
        onClose={() => setConfirmation(null)}
        title={confirmation?.decision === 'VALIDE' ? 'Valider ce paiement ?' : 'Rejeter ce paiement ?'}
        description={
          confirmation
            ? `${formatMoney(confirmation.paiement.montant)} — ${confirmation.paiement.locataireNom}`
            : ''
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmation(null)} disabled={actionEnCours}>
              Annuler
            </Button>
            <Button
              variant={confirmation?.decision === 'VALIDE' ? 'primary' : 'danger'}
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
          <p className="text-sm text-ink-600">
            {confirmation?.decision === 'VALIDE'
              ? 'La facture sera marquée comme payée, une quittance sera générée et le locataire en sera notifié. Cette action est définitive.'
              : 'Le locataire sera notifié du rejet et devra déclarer à nouveau son paiement. Cette action est définitive.'}
          </p>
          {confirmation?.paiement?.preuveUrl && (
            <a
              href={confirmation.paiement.preuveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              Consulter la preuve de paiement <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </Dialog>
    </div>
  )
}
