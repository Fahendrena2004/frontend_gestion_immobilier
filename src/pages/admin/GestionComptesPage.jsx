import { useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Search, Users } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState, { Spinner } from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { adminService } from '@/services/adminService'
import { useAuth } from '@/context/AuthContext'
import { cn, formatDate } from '@/lib/utils'

const ROLE_LABEL = {
  LOCATAIRE: 'Locataire',
  PROPRIETAIRE: 'Propriétaire',
  ADMINISTRATEUR: 'Administrateur',
}

/** Rôles réellement présents dans le projet (UserRole backend). */
const ROLES_BADGE = {
  LOCATAIRE: {
    label: 'Locataire',
    className: 'bg-brand-50 text-brand-700 ring-brand-200/60',
    dot: 'bg-brand-500',
  },
  PROPRIETAIRE: {
    label: 'Propriétaire',
    className: 'bg-gold-50 text-gold-700 ring-gold-300/60',
    dot: 'bg-gold-500',
  },
  ADMINISTRATEUR: {
    label: 'Administrateur',
    className: 'bg-ink-100 text-ink-700 ring-ink-200',
    dot: 'bg-ink-400',
  },
}

/** Statuts de compte réellement utilisés (ACTIF / SUSPENDU). */
const STATUTS_COMPTE = {
  ACTIF: {
    label: 'Actif',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-300/60',
    dot: 'bg-emerald-500',
  },
  SUSPENDU: {
    label: 'Suspendu',
    className: 'bg-brick-50 text-brick-600 ring-brick-300/60',
    dot: 'bg-brick-500',
  },
}

/** Badges locaux à la page (les composants partagés ne sont pas modifiés). */
function BadgeLocal({ config, fallback }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
        config.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label ?? fallback}
    </span>
  )
}

export default function GestionComptesPage() {
  const { user: adminConnecte } = useAuth()

  const [roleFilter, setRoleFilter] = useState('')
  const [recherche, setRecherche] = useState('')
  const [page, setPage] = useState(1)
  const rechercheDifferee = useDebouncedValue(recherche, 300)

  // Le filtrage et la recherche sont effectués par l'API, sur l'ensemble des
  // comptes et non sur la page affichée.
  const { data, setData, loading, error, reload } = useApiResource(
    () => adminService.listUsers({ role: roleFilter, search: rechercheDifferee, page }),
    [roleFilter, rechercheDifferee, page],
    { initialData: { items: [], meta: null } }
  )

  const users = data.items
  const [actionEnCours, setActionEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [confirmation, setConfirmation] = useState(null) // compte à suspendre

  async function basculerStatut(utilisateur) {
    const nouveau = utilisateur.statut === 'ACTIF' ? 'SUSPENDU' : 'ACTIF'

    setActionEnCours(utilisateur.id)
    setActionError(null)
    try {
      const misAJour = await adminService.toggleUserStatus(utilisateur.id, nouveau)
      setData((prev) => ({
        ...prev,
        items: prev.items.map((u) => (u.id === utilisateur.id ? { ...u, statut: misAJour.statut } : u)),
      }))
      setConfirmation(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  /** La suspension révoque les sessions : elle demande confirmation.
   *  La réaction est sans risque et s'effectue directement. */
  function demanderAction(utilisateur) {
    if (utilisateur.statut === 'ACTIF') setConfirmation(utilisateur)
    else basculerStatut(utilisateur)
  }

  return (
    <div className="space-y-5 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
              <Users className="h-5 w-5 text-gold-300" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                Administration
              </p>
              <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
                Gestion des comptes
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Suspendre un compte révoque immédiatement ses sessions actives.
              </p>
            </div>
          </div>
          {data.meta && (
            <p className="shrink-0 text-sm text-ink-500 sm:text-right">
              <span className="font-display text-lg font-bold text-brand-800">
                {data.meta.total}
              </span>{' '}
              compte{data.meta.total > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </header>

      {/* Recherche et filtres */}
      <div className="rounded-xl border border-ink-100 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-ink-400"
              aria-hidden="true"
            />
            <Input
              label="Rechercher"
              placeholder="Nom ou e-mail"
              value={recherche}
              onChange={(e) => { setRecherche(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <div className="sm:w-48">
            <Select
              label="Rôle"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="w-full"
            >
              <option value="">Tous les rôles</option>
              <option value="LOCATAIRE">Locataires</option>
              <option value="PROPRIETAIRE">Propriétaires</option>
              <option value="ADMINISTRATEUR">Administrateurs</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les comptes" message={error}>
            <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && !confirmation && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des comptes…" className="rounded-xl border border-ink-100 bg-white py-12" />}

        {!loading && !error && users.length === 0 && (
          <EmptyState
            icon={Users}
            title="Aucun compte trouvé"
            description="Aucun compte ne correspond à ces critères."
            className="rounded-xl bg-white py-12"
          />
        )}

        {users.length > 0 && (
        <div className="[&>div]:rounded-xl">
          <Table>
            <Thead className="border-b-2 border-gold-500/40 bg-white text-[11px] tracking-wider text-brand-800/90">
              <tr>
                <Th className="px-5 py-3.5">Utilisateur</Th>
                <Th className="px-5 py-3.5">Rôle</Th>
                <Th className="px-5 py-3.5">Inscrit le</Th>
                <Th className="px-5 py-3.5">Statut</Th>
                <Th className="px-5 py-3.5 text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <tbody>
              {users.map((u) => {
                // L'API refuse de modifier un administrateur ou son propre compte :
                // l'action n'est donc pas proposée.
                const modifiable = u.role !== 'ADMINISTRATEUR' && u.id !== adminConnecte?.id
                const enCours = actionEnCours === u.id

                return (
                  <Tr key={u.id} className="transition-colors duration-150 hover:bg-brand-50/50">
                    <Td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.nom} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-900">{u.nom}</p>
                          <p className="truncate text-xs text-ink-500">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="px-5 py-4">
                      <BadgeLocal config={ROLES_BADGE[u.role] ?? { className: 'bg-ink-100 text-ink-600 ring-ink-200', dot: 'bg-ink-400' }} fallback={u.role} />
                    </Td>
                    <Td className="px-5 py-4 whitespace-nowrap">{formatDate(u.dateInscription)}</Td>
                    <Td className="px-5 py-4">
                      <BadgeLocal config={STATUTS_COMPTE[u.statut] ?? { className: 'bg-ink-100 text-ink-600 ring-ink-200', dot: 'bg-ink-400' }} fallback={u.statut} />
                    </Td>
                    <Td className="px-5 py-4">
                      {modifiable ? (
                        enCours ? (
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
                            <Spinner className="h-4 w-4 border-2" />
                            Traitement…
                          </span>
                        ) : (
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant={u.statut === 'ACTIF' ? 'danger' : 'primary'}
                              className="rounded-lg shadow-sm transition-all duration-150 hover:shadow"
                              disabled={enCours}
                              onClick={() => demanderAction(u)}
                            >
                              {u.statut === 'ACTIF' ? 'Suspendre' : 'Réactiver'}
                            </Button>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-ink-400">
                          {u.id === adminConnecte?.id ? 'Votre compte' : 'Compte administrateur'}
                        </span>
                      )}
                    </Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>
        </div>
        )}

        {!loading && !error && users.length > 0 && data.meta && data.meta.last_page > 1 && (
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
              Page {data.meta.current_page} sur {data.meta.last_page} — {data.meta.total} compte{data.meta.total > 1 ? 's' : ''} au total
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
        title="Suspendre ce compte ?"
        description={confirmation ? `${confirmation.nom} — ${confirmation.email}` : ''}
        className="rounded-xl border border-ink-100 shadow-2xl"
        footer={
          <>
            <Button variant="outline" className="rounded-lg" onClick={() => setConfirmation(null)} disabled={actionEnCours === confirmation?.id}>
              Annuler
            </Button>
            <Button variant="danger" className="rounded-lg shadow-sm" onClick={() => confirmation && basculerStatut(confirmation)} disabled={actionEnCours === confirmation?.id}>
              {actionEnCours === confirmation?.id ? 'Suspension…' : 'Suspendre'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {actionError && <Alert message={actionError} />}
          <div className="flex items-start gap-2.5 rounded-lg border border-gold-100 bg-gold-50/60 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
            <p className="text-sm text-ink-700">
              Toutes les sessions actives de l'utilisateur seront révoquées. Il ne pourra plus se
              connecter tant que le compte n'est pas réactivé.
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
