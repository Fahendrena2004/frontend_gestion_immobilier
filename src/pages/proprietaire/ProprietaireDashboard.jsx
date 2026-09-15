import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ClipboardList, CalendarCheck, Plus, Home, Mail, MapPin } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      propertyService.search({ proprietaireId: user?.id }),
      rentalService.listDemandes(),
    ]).then(([logementsData, demandesData]) => {
      setLogements(logementsData.length ? logementsData : [])
      setDemandes(demandesData)
      setLoading(false)
    })
  }, [user])

  const demandesEnAttente = demandes.filter((d) => d.statut === 'EN_ATTENTE').length

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(189,143,52,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Bonjour <span className="text-gold-300">{user?.nom?.split(' ')[0]}</span> 👋
              </h1>
              <p className="mt-2 text-lg text-brand-100/90 max-w-xl">
                Gérez vos annonces, suivez vos demandes et organisez vos visites en toute simplicité.
              </p>
            </div>
            <Link to="/proprietaire/logements/nouveau">
              <Button size="lg" className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-brand-900 shadow-lg hover:shadow-xl transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un logement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Building2}
            label="Mes logements"
            value={logements.length}
            to="/proprietaire/logements"
            iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
            iconColor="text-white"
          />
          <StatCard
            icon={ClipboardList}
            label="Demandes en attente"
            value={demandes.filter((d) => d.statut === 'EN_ATTENTE').length}
            to="/proprietaire/demandes"
            highlight={demandes.filter((d) => d.statut === 'EN_ATTENTE').length > 0}
            iconBg="bg-gradient-to-br from-gold-500 to-gold-700"
            iconColor="text-white"
          />
          <StatCard
            icon={CalendarCheck}
            label="Visites à organiser"
            value={demandes.filter((d) => d.statut === 'ACCEPTEE').length}
            to="/proprietaire/visites"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
            iconColor="text-white"
          />
        </div>

        {/* Mes Logements */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
            <div>
              <h2 className="font-display text-xl lg:text-2xl font-bold text-ink-900">Mes logements</h2>
              <p className="mt-1 text-sm text-ink-500">{logements.length} annonce{logements.length > 1 ? 's' : ''} publiée{logements.length > 1 ? 's' : ''}</p>
            </div>
            <Link to="/proprietaire/logements" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Voir tout
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {loading ? (
            <Card className="bg-white border-ink-100 shadow-sm">
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-200 border-t-brand-600" />
              </div>
            </Card>
          ) : logements.length === 0 ? (
            <Card className="bg-white border-ink-100 shadow-sm">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                  <Home className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900 mb-2">Aucun logement pour le moment</h3>
                <p className="text-ink-500 mb-6 max-w-md mx-auto">Commencez par publier votre première annonce pour attirer des locataires.</p>
                <Link to="/proprietaire/logements/nouveau">
                  <Button className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Publier ma première annonce
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="bg-white border-ink-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-ink-100">
                {logements.slice(0, 4).map((l) => (
                  <Link key={l.id} to={`/proprietaire/logements/${l.id}/modifier`} className="flex items-center justify-between px-5 py-4 hover:bg-ink-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{l.titre}</p>
                        <p className="text-xs text-ink-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {l.quartier}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={l.statut} />
                      <svg className="h-5 w-5 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </section>

        {/* Dernières demandes */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
            <div>
              <h2 className="font-display text-xl lg:text-2xl font-bold text-ink-900">Dernières demandes</h2>
              <p className="mt-1 text-sm text-ink-500">{demandes.length} demande{demandes.length > 1 ? 's' : ''} au total</p>
            </div>
            <Link to="/proprietaire/demandes" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Voir tout
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {demandes.length === 0 ? (
            <Card className="bg-white border-ink-100 shadow-sm">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900 mb-2">Aucune demande pour le moment</h3>
                <p className="text-ink-500 mb-6 max-w-md mx-auto">Les locataires intéressés par vos logements apparaîtront ici.</p>
              </div>
            </Card>
          ) : (
            <Card className="bg-white border-ink-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-ink-100">
                {demandes.slice(0, 4).map((d) => (
                  <Link key={d.id} to={`/proprietaire/demandes`} className="flex items-center justify-between px-5 py-4 hover:bg-ink-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="h-6 w-6 text-gold-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{d.logementTitre}</p>
                        <p className="text-xs text-ink-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {d.logementTitre}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={d.statut} />
                      <svg className="h-5 w-5 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to, highlight, iconBg, iconColor }) {
  return (
    <Link to={to}>
      <Card className={`bg-white border-ink-100 shadow-sm transition-all hover:shadow-md ${highlight ? 'border-gold-300 shadow-gold-100/50' : ''}`}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">{label}</p>
            <p className="font-display text-2xl font-bold text-ink-900 mt-1">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}