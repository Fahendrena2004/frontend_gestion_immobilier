import { useState } from 'react'
import { AlertTriangle, Ban, Check, ChevronLeft, ChevronRight, ShieldCheck, Trash2 } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState, { Spinner } from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { adminService } from '@/services/adminService'
import { cn, formatMoney } from '@/lib/utils'

const FILTRES = [
  { value: '', label: 'Toutes les annonces' },
  { value: 'EN_ATTENTE', label: 'À modérer' },
  { value: 'APPROUVE', label: 'Approuvées' },
  { value: 'SUSPENDU', label: 'Suspendues' },
  { value: 'SUPPRIME', label: 'Supprimées' },
]

/** Action de modération -> statut qui en résulte. */
const RESULTAT_ACTION = {
  APPROUVER: 'APPROUVE',
  SUSPENDRE: 'SUSPENDU',
  SUPPRIMER: 'SUPPRIME',
}

/** Libellés des actions restrictives (confirmation requise). */
const CONFIRMATIONS = {
  SUSPENDRE: {
    titre: 'Suspendre cette annonce ?',
    consequence:
      "L'annonce sera retirée de la recherche publique jusqu'à sa réactivation. Le propriétaire en sera notifié.",
    bouton: 'Suspendre',
  },
  SUPPRIMER: {
    titre: 'Retirer cette annonce ?',
    consequence:
      "L'annonce sera retirée de la recherche publique. Le propriétaire en sera notifié et pourra la republier ultérieurement.",
    bouton: 'Retirer',
  },
}

/** Statuts de modération réellement utilisés (ModerationStatus backend). */
const STATUTS_MODERATION = {
  EN_ATTENTE: {
    label: 'En attente',
    className: 'bg-gold-50 text-gold-700 ring-gold-300/60',
    dot: 'bg-gold-500',
  },
  APPROUVE: {
    label: 'Approuvée',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  SUSPENDU: {
    label: 'Suspendu',
    className: 'bg-brick-50 text-brick-600 ring-brick-300/60',
    dot: 'bg-brick-500',
  },
  SUPPRIME: {
    label: 'Supprimée',
    className: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  },
}

/** Badge de statut local à la page (les composants partagés ne sont pas modifiés). */
function BadgeStatutModeration({ status }) {
  const config = STATUTS_MODERATION[status] ?? {
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

export default function ModerationAnnoncesPage() {
  const [filtre, setFiltre] = useState('')
  const [page, setPage] = useState(1)

  const { data, setData, loading, error, reload } = useApiResource(
    () => adminService.listAnnonces({ statutModeration: filtre, page }),
    [filtre, page],
    { initialData: { items: [], meta: null } }
  )

  const annonces = data.items
  const [actionEnCours, setActionEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [confirmation, setConfirmation] = useState(null) // { annonce, action }

  async function moderer(id, action) {
    setActionEnCours(id)
    setActionError(null)
    try {
      await adminService.moderateAnnonce(id, action)
      const nouveauStatut = RESULTAT_ACTION[action]

      setData((prev) => ({
        ...prev,
        // Si un filtre est actif, l'annonce quitte la liste dès qu'elle n'y
        // correspond plus.
        items: filtre && filtre !== nouveauStatut
          ? prev.items.filter((a) => a.id !== id)
          : prev.items.map((a) => (a.id === id ? { ...a, statut: nouveauStatut } : a)),
      }))
      setConfirmation(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  /** Approuver agit directement ; suspendre et retirer demandent confirmation. */
  function demanderAction(annonce, action) {
    if (action === 'APPROUVER') moderer(annonce.id, action)
    else setConfirmation({ annonce, action })
  }

  function confirmer() {
    if (confirmation) moderer(confirmation.annonce.id, confirmation.action)
  }

  return (
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
              <ShieldCheck className="h-5 w-5 text-gold-300" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                Administration
              </p>
              <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
                Modération des annonces
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Seules les annonces approuvées apparaissent dans la recherche publique.
              </p>
            </div>
          </div>
          {data.meta && (
            <p className="shrink-0 text-sm text-ink-500 sm:text-right">
              <span className="font-display text-lg font-bold text-brand-800">
                {data.meta.total}
              </span>{' '}
              annonce{data.meta.total > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </header>

      {/* Filtres */}
      <div className="rounded-xl border border-ink-100 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden overflow-x-auto sm:block">
            <div className="inline-flex min-w-max rounded-lg border border-ink-200 bg-ink-50/80 p-1">
              {FILTRES.map((f) => {
                const actif = filtre === f.value
                return (
                  <button
                    key={f.value}
                    type="button"
                    aria-pressed={actif}
                    onClick={() => { setFiltre(f.value); setPage(1) }}
                    className={cn(
                      'whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300',
                      actif
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-ink-600 hover:bg-white hover:text-brand-700'
                    )}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="sm:hidden">
            <Select
              label="Filtrer"
              value={filtre}
              onChange={(e) => { setFiltre(e.target.value); setPage(1) }}
              className="w-full"
            >
              {FILTRES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les annonces" message={error}>
            <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && !confirmation && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des annonces…" className="rounded-xl border border-ink-100 bg-white py-12" />}

        {!loading && !error && annonces.length === 0 && (
          <EmptyState
            icon={ShieldCheck}
            title="Aucune annonce à afficher"
            description={filtre ? 'Aucune annonce ne correspond à ce filtre.' : 'Aucune annonce publiée pour le moment.'}
            className="rounded-xl bg-white py-12"
          />
        )}

        {annonces.length > 0 && (
        <div className="[&>div]:rounded-xl">
          <Table>
            <Thead className="border-b-2 border-gold-500/40 bg-white text-[11px] tracking-wider text-brand-800/90">
              <tr>
                <Th className="px-5 py-3.5">Logement</Th>
                <Th className="px-5 py-3.5">Propriétaire</Th>
                <Th className="px-5 py-3.5">Quartier</Th>
                <Th className="px-5 py-3.5 text-right">Loyer</Th>
                <Th className="px-5 py-3.5">Publication</Th>
                <Th className="px-5 py-3.5 text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <tbody>
              {annonces.map((a) => {
                const enCours = actionEnCours === a.id
                return (
                  <Tr key={a.id} className="transition-colors duration-150 hover:bg-brand-50/50">
                    <Td className="px-5 py-4">
                      <p className="font-medium text-ink-900">{a.titre}</p>
                      <span className="mt-0.5 block text-xs font-normal text-ink-400">
                        {[a.type, a.pieces ? `${a.pieces} pièces` : null, a.surface ? `${a.surface} m²` : null,
                          `${a.nombrePhotos} photo${a.nombrePhotos > 1 ? 's' : ''}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </Td>
                    <Td className="px-5 py-4">{a.proprietaireNom}</Td>
                    <Td className="px-5 py-4">{a.quartier}</Td>
                    <Td className="px-5 py-4 text-right font-medium tabular-nums text-ink-900">
                      {formatMoney(a.prix)}
                    </Td>
                    <Td className="px-5 py-4"><BadgeStatutModeration status={a.statut} /></Td>
                    <Td className="px-5 py-4">
                      {enCours ? (
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
                          <Spinner className="h-4 w-4 border-2" />
                          Traitement…
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {a.statut !== 'APPROUVE' && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="rounded-lg shadow-sm transition-all duration-150 hover:shadow focus:ring-gold-300/70"
                              disabled={enCours}
                              onClick={() => demanderAction(a, 'APPROUVER')}
                            >
                              <Check className="h-3.5 w-3.5" /> Approuver
                            </Button>
                          )}
                          {a.statut !== 'SUSPENDU' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg transition-all duration-150 hover:border-brick-300 hover:text-brick-600"
                              disabled={enCours}
                              onClick={() => demanderAction(a, 'SUSPENDRE')}
                            >
                              <Ban className="h-3.5 w-3.5" /> Suspendre
                            </Button>
                          )}
                          {a.statut !== 'SUPPRIME' && (
                            <Button
                              size="sm"
                              variant="danger"
                              className="rounded-lg shadow-sm transition-all duration-150 hover:shadow"
                              disabled={enCours}
                              aria-label="Retirer l'annonce"
                              onClick={() => demanderAction(a, 'SUPPRIMER')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>
        </div>
        )}

        {!loading && !error && annonces.length > 0 && data.meta && data.meta.last_page > 1 && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={data.meta.current_page <= 1 || !!actionEnCours}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <p className="rounded-full border border-ink-200 bg-white px-4 py-1 text-sm font-medium text-ink-700">
              Page {data.meta.current_page} sur {data.meta.last_page} — {data.meta.total} annonce{data.meta.total > 1 ? 's' : ''} au total
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={data.meta.current_page >= data.meta.last_page || !!actionEnCours}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={!!confirmation}
        onClose={() => setConfirmation(null)}
        title={confirmation ? CONFIRMATIONS[confirmation.action].titre : ''}
        description={confirmation ? `${confirmation.annonce.titre} — ${confirmation.annonce.proprietaireNom}` : ''}
        className="rounded-xl border border-ink-100 shadow-2xl"
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setConfirmation(null)} disabled={!!actionEnCours}>
              Annuler
            </Button>
            <Button variant="danger" className="rounded-lg shadow-sm" onClick={confirmer} disabled={!!actionEnCours}>
              {actionEnCours ? 'Traitement…' : confirmation ? CONFIRMATIONS[confirmation.action].bouton : ''}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {actionError && <Alert message={actionError} />}
          <div className="flex items-start gap-2.5 rounded-lg border border-gold-100 bg-gold-50/60 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
            <p className="text-sm text-ink-700">
              {confirmation ? CONFIRMATIONS[confirmation.action].consequence : ''}
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
