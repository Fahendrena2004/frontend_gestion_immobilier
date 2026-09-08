import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ClipboardList, Wallet, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { reportingService } from '@/services/reportingService'
import { formatMoney } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    reportingService.getDashboardStats().then(setStats)
  }, [])

  if (!stats) return null

  const maxEvolution = Math.max(...stats.evolutionDemandes.map((e) => e.valeur))

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Tableau de bord administrateur</h1>
      <p className="mt-1 text-sm text-ink-500">Vue d'ensemble de l'activité de la plateforme.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Logements disponibles" value={`${stats.logementsDisponibles} / ${stats.totalLogements}`} to="/admin/moderation" />
        <StatCard icon={ClipboardList} label="Demandes en attente" value={stats.demandesEnAttente} to="/admin/moderation" />
        <StatCard icon={Wallet} label="Paiements à vérifier" value={stats.paiementsEnAttenteVerification} to="/admin/paiements" highlight={stats.paiementsEnAttenteVerification > 0} />
        <StatCard icon={TrendingUp} label="Revenus du mois" value={formatMoney(stats.revenusDuMois)} to="/admin/statistiques" />
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Évolution des demandes de location</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-4">
            {stats.evolutionDemandes.map((e) => (
              <div key={e.mois} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-brand-600"
                  style={{ height: `${(e.valeur / maxEvolution) * 100}%`, minHeight: '4px' }}
                  title={`${e.valeur} demandes`}
                />
                <span className="text-xs font-medium text-ink-500">{e.mois}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
