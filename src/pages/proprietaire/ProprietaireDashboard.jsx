import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ClipboardList, CalendarCheck, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import { propertyService } from '@/services/propertyService'
import { rentalService } from '@/services/rentalService'
import { useAuth } from '@/context/AuthContext'

export default function ProprietaireDashboard() {
  const { user } = useAuth()
  const [logements, setLogements] = useState([])
  const [demandes, setDemandes] = useState([])

  useEffect(() => {
    propertyService.search({ proprietaireId: user?.id }).then((data) => setLogements(data.length ? data : []))
    rentalService.listDemandes().then(setDemandes)
  }, [user])

  const demandesEnAttente = demandes.filter((d) => d.statut === 'EN_ATTENTE').length

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Bonjour {user?.nom?.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-ink-500">Suivez vos annonces et vos demandes en un coup d'œil.</p>
        </div>
        <Link to="/proprietaire/logements/nouveau">
          <Button><Plus className="h-4 w-4" /> Ajouter un logement</Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Mes logements" value={logements.length} to="/proprietaire/logements" />
        <StatCard icon={ClipboardList} label="Demandes en attente" value={demandesEnAttente} to="/proprietaire/demandes" highlight={demandesEnAttente > 0} />
        <StatCard icon={CalendarCheck} label="Visites à organiser" value={2} to="/proprietaire/visites" />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Mes logements</h2>
          <Link to="/proprietaire/logements" className="text-sm font-medium text-brand-700 hover:underline">Voir tout</Link>
        </div>
        <Card>
          <div className="divide-y divide-ink-100">
            {logements.slice(0, 4).map((l) => (
              <div key={l.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink-900">{l.titre}</p>
                  <p className="text-xs text-ink-500">{l.quartier}</p>
                </div>
                <StatusBadge status={l.statut} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to, highlight }) {
  return (
    <Link to={to}>
      <Card className={highlight ? 'border-gold-300' : ''}>
        <CardContent className="flex items-center gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${highlight ? 'bg-gold-50 text-gold-600' : 'bg-brand-50 text-brand-700'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">{label}</p>
            <p className="font-display text-lg font-semibold text-ink-900">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
