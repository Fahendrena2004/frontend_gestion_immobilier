import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { adminService } from '@/services/adminService'
import { formatDate } from '@/lib/utils'

const ROLE_LABEL = { LOCATAIRE: 'Locataire', PROPRIETAIRE: 'Propriétaire', ADMINISTRATEUR: 'Administrateur' }

export default function GestionComptesPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    adminService.listUsers().then((data) => {
      setUsers(data)
      setLoading(false)
    })
  }, [])

  async function handleToggle(id, currentStatut) {
    const next = currentStatut === 'ACTIF' ? 'SUSPENDU' : 'ACTIF'
    await adminService.toggleUserStatus(id, next)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, statut: next } : u)))
  }

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Gestion des comptes</h1>
          <p className="mt-1 text-sm text-ink-500">Consultez et gérez les comptes locataires et propriétaires.</p>
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:w-56">
          <option value="">Tous les rôles</option>
          <option value="LOCATAIRE">Locataires</option>
          <option value="PROPRIETAIRE">Propriétaires</option>
        </Select>
      </div>

      <div className="mt-6">
        {!loading && filtered.length === 0 ? (
          <EmptyState icon={Users} title="Aucun compte trouvé" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Utilisateur</Th>
                <Th>Rôle</Th>
                <Th>Inscrit le</Th>
                <Th>Statut</Th>
                <Th></Th>
              </tr>
            </Thead>
            <tbody>
              {filtered.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.nom} size="sm" />
                      <div>
                        <p className="font-medium text-ink-900">{u.nom}</p>
                        <p className="text-xs text-ink-500">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{ROLE_LABEL[u.role]}</Td>
                  <Td>{formatDate(u.dateInscription)}</Td>
                  <Td><StatusBadge status={u.statut} /></Td>
                  <Td>
                    <Button
                      size="sm"
                      variant={u.statut === 'ACTIF' ? 'danger' : 'outline'}
                      onClick={() => handleToggle(u.id, u.statut)}
                    >
                      {u.statut === 'ACTIF' ? 'Suspendre' : 'Réactiver'}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  )
}
