import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, CalendarCheck, KeyRound, Receipt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import StatusBadge from '@/components/shared/StatusBadge'
import { rentalService } from '@/services/rentalService'
import { contractService } from '@/services/contractService'
import { useAuth } from '@/context/AuthContext'
import { formatMoney, formatDate } from '@/lib/utils'

export default function LocataireDashboard() {
  const { user } = useAuth()
  const [demandes, setDemandes] = useState([])
  const [visites, setVisites] = useState([])
  const [location, setLocation] = useState(null)

  useEffect(() => {
    rentalService.listDemandes().then(setDemandes)
    rentalService.listVisites().then(setVisites)
    contractService.getMaLocationActive().then(setLocation)
  }, [])

  const demandesEnAttente = demandes.filter((d) => d.statut === 'EN_ATTENTE').length
  const factureEnAttente = location?.factures.find((f) => f.statut === 'EN_ATTENTE')

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Bonjour {user?.nom?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-ink-500">Voici un aperçu de votre activité locative.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Demandes en attente" value={demandesEnAttente} to="/locataire/demandes" />
        <StatCard icon={CalendarCheck} label="Visites planifiées" value={visites.length} to="/locataire/visites" />
        <StatCard
          icon={KeyRound}
          label="Location active"
          value={location ? 1 : 0}
          to="/locataire/location"
        />
        <StatCard
          icon={Receipt}
          label="Facture à régler"
          value={factureEnAttente ? formatMoney(factureEnAttente.montant) : 'Aucune'}
          to="/locataire/location"
          highlight={!!factureEnAttente}
        />
      </div>

      {location && (
        <Card className="mt-8">
          <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Ma location actuelle</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">{location.logementTitre}</h2>
              <p className="text-sm text-ink-500">{location.quartier}, Fianarantsoa · depuis le {formatDate(location.dateDebut)}</p>
            </div>
            <StatusBadge status={location.statut} />
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Demandes récentes</h2>
          <Link to="/locataire/demandes" className="text-sm font-medium text-brand-700 hover:underline">Voir tout</Link>
        </div>
        <Card>
          <div className="divide-y divide-ink-100">
            {demandes.slice(0, 3).map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink-900">{d.logementTitre}</p>
                  <p className="text-xs text-ink-500">Envoyée le {formatDate(d.dateEnvoi)}</p>
                </div>
                <StatusBadge status={d.statut} />
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
