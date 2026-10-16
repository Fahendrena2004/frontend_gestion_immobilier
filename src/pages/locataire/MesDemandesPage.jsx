import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileX2 } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState, { Spinner } from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { rentalService } from '@/services/rentalService'
import { cn, formatDate } from '@/lib/utils'

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

export default function MesDemandesPage() {
  const { data: demandes, setData: setDemandes, loading, error, reload } = useApiResource(
    () => rentalService.listDemandes(),
    [],
    { initialData: [] }
  )

  const [annulationEnCours, setAnnulationEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)

  async function handleCancel(id) {
    setAnnulationEnCours(id)
    setActionError(null)
    try {
      const misAJour = await rentalService.cancelDemande(id)
      setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut: misAJour.statut } : d)))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setAnnulationEnCours(null)
    }
  }

  return (
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
            <FileX2 className="h-5 w-5 text-gold-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Espace locataire
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
              Mes demandes de location
            </h1>
            <p className="mt-1 text-sm text-ink-500">Suivez le statut de vos demandes envoyées aux propriétaires.</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger vos demandes" message={error}>
            <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement de vos demandes…" className="rounded-xl border border-ink-100 bg-white py-12" />}

        {!loading && !error && demandes.length === 0 && (
          <EmptyState
            icon={FileX2}
            title="Aucune demande envoyée"
            description="Parcourez les logements disponibles pour envoyer votre première demande."
            className="rounded-xl bg-white py-12"
            action={<Link to="/"><Button className="rounded-lg shadow-sm">Voir les logements</Button></Link>}
          />
        )}

        {demandes.length > 0 && (
        <div className="[&>div]:rounded-xl">
          <Table>
            <Thead className="border-b-2 border-gold-500/40 bg-white text-[11px] tracking-wider text-brand-800/90">
              <tr>
                <Th className="px-5 py-3.5">Logement</Th>
                <Th className="px-5 py-3.5">Message</Th>
                <Th className="px-5 py-3.5">Date d'envoi</Th>
                <Th className="px-5 py-3.5">Statut</Th>
                <Th className="px-5 py-3.5 text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <tbody>
              {demandes.map((d) => (
                <Tr key={d.id} className="transition-colors duration-150 hover:bg-brand-50/50">
                  <Td className="px-5 py-4 font-medium text-ink-900">{d.logementTitre}</Td>
                  <Td className="max-w-xs truncate px-5 py-4 text-ink-500" title={d.message || undefined}>
                    {d.message || '—'}
                  </Td>
                  <Td className="whitespace-nowrap px-5 py-4">{formatDate(d.dateEnvoi)}</Td>
                  <Td className="px-5 py-4"><BadgeStatutDemande status={d.statut} /></Td>
                  <Td className="px-5 py-4 text-right">
                    {d.statut === 'EN_ATTENTE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg transition-all duration-150 hover:border-brick-300 hover:text-brick-600"
                        disabled={annulationEnCours === d.id}
                        onClick={() => handleCancel(d.id)}
                      >
                        {annulationEnCours === d.id ? (
                          <>
                            <Spinner className="h-3.5 w-3.5 border-2" />
                            Annulation…
                          </>
                        ) : (
                          'Annuler'
                        )}
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
        )}
      </div>
    </div>
  )
}
