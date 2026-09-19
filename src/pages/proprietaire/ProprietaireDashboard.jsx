import { Link } from 'react-router-dom'
import { Building2, ClipboardList, CalendarCheck, Plus, Home, Mail, MapPin, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import useApiResource from '@/hooks/useApiResource'
import { propertyService } from '@/services/propertyService'
import { rentalService } from '@/services/rentalService'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'

/** Visites qui réclament encore une action ou une réponse. */
const VISITES_ACTIVES = ['DEMANDEE', 'PROPOSEE', 'CONFIRMEE']

export default function ProprietaireDashboard() {
  const { user } = useAuth()

  const { data, loading, error, reload } = useApiResource(
    async () => {
      const [annonces, demandes, visites] = await Promise.all([
        propertyService.listMesAnnonces(),
        rentalService.listDemandes(),
        rentalService.listVisites(),
      ])
      return { logements: annonces.items, demandes, visites }
    },
    [],
    { initialData: { logements: [], demandes: [], visites: [] } }
  )

  const { logements, demandes, visites } = data

  const demandesEnAttente = demandes.filter((d) => d.statut === 'EN_ATTENTE').length
  const visitesAOrganiser = visites.filter((v) => VISITES_ACTIVES.includes(v.statut)).length
  const annoncesAValider = logements.filter((l) => l.statutModeration === 'EN_ATTENTE').length

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(189,143,52,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Bonjour <span className="text-gold-300">{user?.nom?.split(' ')[0]}</span> 👋
              </h1>
              <p className="mt-2 max-w-xl text-lg text-brand-100/90">
                Gérez vos annonces, suivez vos demandes et organisez vos visites.
              </p>
            </div>
            <Link to="/proprietaire/logements/nouveau">
              <Button size="lg" className="w-full bg-gold-500 text-brand-900 hover:bg-gold-600 sm:w-auto">
                <Plus className="h-4 w-4" /> Ajouter un logement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error && (
          <Alert title="Certaines données n'ont pas pu être chargées" message={error} className="mb-6">
            <Button variant="outline" size="sm" className="mt-2" onClick={reload}>Réessayer</Button>
          </Alert>
        )}

        {loading ? (
          <LoadingState label="Chargement de votre tableau de bord…" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={Building2}
                label="Mes logements"
                value={logements.length}
                hint={annoncesAValider > 0 ? `${annoncesAValider} en attente de validation` : null}
                to="/proprietaire/logements"
                iconBg="bg-gradient-to-br from-brand-500 to-brand-700"
              />
              <StatCard
                icon={ClipboardList}
                label="Demandes en attente"
                value={demandesEnAttente}
                to="/proprietaire/demandes"
                highlight={demandesEnAttente > 0}
                iconBg="bg-gradient-to-br from-gold-500 to-gold-700"
              />
              <StatCard
                icon={CalendarCheck}
                label="Visites à organiser"
                value={visitesAOrganiser}
                to="/proprietaire/visites"
                highlight={visites.some((v) => v.statut === 'DEMANDEE')}
                iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
              />
            </div>

            <Section
              titre="Mes logements"
              sousTitre={`${logements.length} annonce${logements.length > 1 ? 's' : ''}`}
              lienVersTout="/proprietaire/logements"
              vide={logements.length === 0}
              icone={Home}
              titreVide="Aucun logement pour le moment"
              descriptionVide="Commencez par publier votre première annonce pour attirer des locataires."
              actionVide={
                <Link to="/proprietaire/logements/nouveau">
                  <Button><Plus className="h-4 w-4" /> Publier ma première annonce</Button>
                </Link>
              }
            >
              {logements.slice(0, 4).map((l) => (
                <Link
                  key={l.id}
                  to={`/proprietaire/logements/${l.id}/modifier`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-ink-50/60"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50">
                      {l.photoPrincipale ? (
                        <img src={l.photoPrincipale} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-6 w-6 text-brand-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{l.titre}</p>
                      <p className="flex items-center gap-1 text-xs text-ink-500">
                        <MapPin className="h-3 w-3" /> {l.quartier}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={l.statutModeration} />
                    <StatusBadge status={l.statut} />
                    <ChevronRight className="h-5 w-5 text-ink-300" />
                  </div>
                </Link>
              ))}
            </Section>

            <Section
              titre="Dernières demandes"
              sousTitre={`${demandes.length} demande${demandes.length > 1 ? 's' : ''} au total`}
              lienVersTout="/proprietaire/demandes"
              vide={demandes.length === 0}
              icone={Mail}
              titreVide="Aucune demande pour le moment"
              descriptionVide="Les locataires intéressés par vos logements apparaîtront ici."
            >
              {demandes.slice(0, 4).map((d) => (
                <Link
                  key={d.id}
                  to="/proprietaire/demandes"
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-ink-50/60"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-50">
                      <ClipboardList className="h-6 w-6 text-gold-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{d.logementTitre}</p>
                      <p className="text-xs text-ink-500">
                        {d.locataireNom} · {formatDate(d.dateEnvoi)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={d.statut} />
                    <ChevronRight className="h-5 w-5 text-ink-300" />
                  </div>
                </Link>
              ))}
            </Section>
          </>
        )}
      </main>
    </div>
  )
}

function Section({
  titre, sousTitre, lienVersTout, vide, icone: Icone,
  titreVide, descriptionVide, actionVide, children,
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900 lg:text-2xl">{titre}</h2>
          <p className="mt-1 text-sm text-ink-500">{sousTitre}</p>
        </div>
        <Link
          to={lienVersTout}
          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Voir tout <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <Card className="overflow-hidden">
        {vide ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <Icone className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-ink-900">{titreVide}</h3>
            <p className="mx-auto mb-6 max-w-md text-ink-500">{descriptionVide}</p>
            {actionVide}
          </div>
        ) : (
          <div className="divide-y divide-ink-100">{children}</div>
        )}
      </Card>
    </section>
  )
}

function StatCard({ icon: Icon, label, value, hint, to, highlight, iconBg }) {
  return (
    <Link to={to}>
      <Card className={`transition-all hover:shadow-md ${highlight ? 'border-gold-300' : ''}`}>
        <CardContent className="flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink-900">{value}</p>
            {hint && <p className="text-xs text-gold-600">{hint}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
