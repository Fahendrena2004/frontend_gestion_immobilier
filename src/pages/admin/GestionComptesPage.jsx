import { useState } from 'react'
import { Users } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { adminService } from '@/services/adminService'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'

const ROLE_LABEL = {
  LOCATAIRE: 'Locataire',
  PROPRIETAIRE: 'Propriétaire',
  ADMINISTRATEUR: 'Administrateur',
}

export default function GestionComptesPage() {
  const { user: adminConnecte } = useAuth()

  const [roleFilter, setRoleFilter] = useState('')
  const [recherche, setRecherche] = useState('')
  const rechercheDifferee = useDebouncedValue(recherche, 300)

  // Le filtrage et la recherche sont effectués par l'API, sur l'ensemble des
  // comptes et non sur la page affichée.
  const { data, setData, loading, error, reload } = useApiResource(
    () => adminService.listUsers({ role: roleFilter, search: rechercheDifferee }),
    [roleFilter, rechercheDifferee],
    { initialData: { items: [], meta: null } }
  )

  const users = data.items
  const [actionEnCours, setActionEnCours] = useState(null)
  const [actionError, setActionError] = useState(null)

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
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionEnCours(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Gestion des comptes</h1>
          <p className="mt-1 text-sm text-ink-500">
            Suspendre un compte révoque immédiatement ses sessions actives.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            label="Rechercher"
            placeholder="Nom ou e-mail"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="sm:w-56"
          />
          <Select
            label="Rôle"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="">Tous les rôles</option>
            <option value="LOCATAIRE">Locataires</option>
            <option value="PROPRIETAIRE">Propriétaires</option>
            <option value="ADMINISTRATEUR">Administrateurs</option>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <Alert title="Impossible de charger les comptes" message={error}>
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}
        {actionError && <Alert message={actionError} />}

        {loading && <LoadingState label="Chargement des comptes…" />}

        {!loading && !error && users.length === 0 && (
          <EmptyState icon={Users} title="Aucun compte trouvé" description="Aucun compte ne correspond à ces critères." />
        )}

        {users.length > 0 && (
          <Table>
            <Thead>
              <tr>
                <Th>Utilisateur</Th>
                <Th>Rôle</Th>
                <Th>Inscrit le</Th>
                <Th>Statut</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <tbody>
              {users.map((u) => {
                // L'API refuse de modifier un administrateur ou son propre compte :
                // l'action n'est donc pas proposée.
                const modifiable = u.role !== 'ADMINISTRATEUR' && u.id !== adminConnecte?.id

                return (
                  <Tr key={u.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.nom} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-900">{u.nom}</p>
                          <p className="truncate text-xs text-ink-500">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>{ROLE_LABEL[u.role] ?? u.role}</Td>
                    <Td>{formatDate(u.dateInscription)}</Td>
                    <Td><StatusBadge status={u.statut} /></Td>
                    <Td>
                      {modifiable ? (
                        <Button
                          size="sm"
                          variant={u.statut === 'ACTIF' ? 'danger' : 'outline'}
                          disabled={actionEnCours === u.id}
                          onClick={() => basculerStatut(u)}
                        >
                          {actionEnCours === u.id
                            ? '…'
                            : u.statut === 'ACTIF' ? 'Suspendre' : 'Réactiver'}
                        </Button>
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
        )}
      </div>
    </div>
  )
}
