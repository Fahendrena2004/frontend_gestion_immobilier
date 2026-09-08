import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { reportingService } from '@/services/reportingService'
import { formatMoney } from '@/lib/utils'

export default function StatistiquesPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    reportingService.getDashboardStats().then(setStats)
  }, [])

  if (!stats) return null

  const maxEvolution = Math.max(...stats.evolutionDemandes.map((e) => e.valeur))

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Statistiques</h1>
          <p className="mt-1 text-sm text-ink-500">Suivez l'activité globale de la plateforme.</p>
        </div>
        <Button variant="outline" onClick={() => reportingService.exportRapport('global')}>
          <Download className="h-4 w-4" /> Exporter le rapport
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Logements au total" value={stats.totalLogements} />
        <MetricCard label="Logements disponibles" value={stats.logementsDisponibles} />
        <MetricCard label="Locations actives" value={stats.totalLocations} />
        <MetricCard label="Demandes en attente" value={stats.demandesEnAttente} />
        <MetricCard label="Paiements à vérifier" value={stats.paiementsEnAttenteVerification} />
        <MetricCard label="Revenus du mois" value={formatMoney(stats.revenusDuMois)} />
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Évolution des demandes de location (5 derniers mois)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-48 items-end gap-6">
            {stats.evolutionDemandes.map((e) => (
              <div key={e.mois} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-ink-500">{e.valeur}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-700 to-brand-500"
                  style={{ height: `${(e.valeur / maxEvolution) * 100}%`, minHeight: '4px' }}
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

function MetricCard({ label, value }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <p className="mt-2 font-display text-2xl font-bold text-ink-900">{value}</p>
      </CardContent>
    </Card>
  )
}
