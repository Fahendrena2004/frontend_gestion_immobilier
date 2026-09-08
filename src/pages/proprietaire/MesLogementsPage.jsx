import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import PropertyCard from '@/components/shared/PropertyCard'
import EmptyState from '@/components/shared/EmptyState'
import Button from '@/components/ui/Button'
import DropdownMenu from '@/components/ui/DropdownMenu'
import { propertyService } from '@/services/propertyService'
import { useAuth } from '@/context/AuthContext'

export default function MesLogementsPage() {
  const { user } = useAuth()
  const [logements, setLogements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    propertyService.search({ proprietaireId: user?.id }).then((data) => {
      setLogements(data)
      setLoading(false)
    })
  }, [user])

  async function handleDelete(id) {
    await propertyService.remove(id)
    setLogements((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Mes logements</h1>
          <p className="mt-1 text-sm text-ink-500">Gérez vos annonces et leur disponibilité.</p>
        </div>
        <Link to="/proprietaire/logements/nouveau">
          <Button><Plus className="h-4 w-4" /> Ajouter un logement</Button>
        </Link>
      </div>

      <div className="mt-6">
        {!loading && logements.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Vous n'avez pas encore de logement"
            description="Ajoutez votre premier logement pour commencer à recevoir des demandes."
            action={<Link to="/proprietaire/logements/nouveau"><Button>Ajouter un logement</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {logements.map((l) => (
              <PropertyCard
                key={l.id}
                property={l}
                actions={
                  <DropdownMenu
                    trigger={<span className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100"><MoreVertical className="h-4 w-4" /></span>}
                    items={[
                      { label: 'Modifier', icon: <Pencil className="h-4 w-4" />, onClick: () => (window.location.href = `/proprietaire/logements/${l.id}/modifier`) },
                      { label: 'Supprimer', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => handleDelete(l.id) },
                    ]}
                  />
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
