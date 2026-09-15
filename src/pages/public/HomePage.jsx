import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, MapPin, FileSearch, CalendarCheck, KeyRound, X } from 'lucide-react'
import PropertyCard from '@/components/shared/PropertyCard'
import EmptyState from '@/components/shared/EmptyState'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { propertyService } from '@/services/propertyService'
import { QUARTIERS } from '@/data/mockData'

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [equipements, setEquipements] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ q: '', quartier: '', type: '', prixMax: '', piecesMin: '', equipements: [] })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    propertyService.listEquipements().then(setEquipements)
    propertyService.listTypes().then(setTypes)
  }, [])

  useEffect(() => {
    setLoading(true)
    const handle = setTimeout(() => {
      propertyService.search(filters).then((data) => {
        setProperties(data)
        setLoading(false)
      })
    }, 200)
    return () => clearTimeout(handle)
  }, [filters])

  const activeFilterCount = useMemo(
    () => [filters.quartier, filters.type, filters.prixMax, filters.piecesMin].filter(Boolean).length + filters.equipements.length,
    [filters]
  )

  function toggleEquipement(id) {
    setFilters((f) => ({
      ...f,
      equipements: f.equipements.includes(id) ? f.equipements.filter((e) => e !== id) : [...f.equipements, id],
    }))
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(189,143,52,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-sm font-medium text-gold-300">
            <MapPin className="h-4 w-4" /> Fianarantsoa
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Trouvez votre prochain logement, sans le détour du bouche-à-oreille.
          </h1>
          <p className="mt-4 max-w-xl text-base text-brand-100/80">
            Toutes les annonces vérifiées de Fianarantsoa, centralisées en un seul endroit — recherchez,
            visitez et louez en toute transparence.
          </p>

          <div className="mt-8 rounded-xl bg-white p-3 shadow-xl sm:flex sm:items-center sm:gap-2 sm:p-2">
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search className="h-5 w-5 shrink-0 text-ink-400" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Un quartier, un type de logement…"
                className="h-11 w-full border-none bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <Button
              type="button"
              variant={showFilters ? 'subtle' : 'outline'}
              className="mt-2 w-full sm:mt-0 sm:w-auto"
              onClick={() => setShowFilters((s) => !s)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {showFilters && (
          <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <Select label="Quartier" value={filters.quartier} onChange={(e) => setFilters((f) => ({ ...f, quartier: e.target.value }))}>
              <option value="">Tous les quartiers</option>
              {QUARTIERS.map((q) => <option key={q} value={q}>{q}</option>)}
            </Select>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-700">Type de logement</label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, type: '' }))}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors flex-shrink-0',
                    filters.type === ''
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-ink-200 text-ink-600 hover:border-ink-300'
                  )}
                >
                  Tous
                </button>
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, type: t }))}
                    className={cn(
                      'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors flex-shrink-0',
                      filters.type === t
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Prix maximum (Ar/mois)"
              type="number"
              placeholder="ex : 500000"
              value={filters.prixMax}
              onChange={(e) => setFilters((f) => ({ ...f, prixMax: e.target.value }))}
            />
            <Select label="Pièces minimum" value={filters.piecesMin} onChange={(e) => setFilters((f) => ({ ...f, piecesMin: e.target.value }))}>
              <option value="">Indifférent</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </Select>

            <div className="sm:col-span-2 lg:col-span-4">
              <p className="mb-2 text-sm font-medium text-ink-700">Équipements</p>
              <div className="flex flex-wrap gap-2">
                {equipements.map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => toggleEquipement(eq.id)}
                    className={
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ' +
                      (filters.equipements.includes(eq.id)
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300')
                    }
                  >
                    {eq.nom}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            {loading ? 'Recherche en cours…' : `${properties.length} logement${properties.length > 1 ? 's' : ''} disponible${properties.length > 1 ? 's' : ''}`}
          </h2>
        </div>

        {!loading && properties.length === 0 && (
          <EmptyState
            icon={FileSearch}
            title="Aucun logement ne correspond à votre recherche"
            description="Essayez d'élargir vos critères : quartier, prix ou équipements."
          />
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>

      {/* COMMENT CA MARCHE */}
      <section id="comment-ca-marche" className="border-t border-ink-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink-900">Comment ça marche</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Step icon={Search} title="Recherchez" text="Filtrez les annonces par quartier, prix, type et équipements." />
            <Step icon={CalendarCheck} title="Visitez" text="Envoyez une demande, organisez une visite avec le propriétaire." />
            <Step icon={KeyRound} title="Emménagez" text="Signez le contrat, suivez vos factures et vos paiements en ligne." />
          </div>
        </div>
      </section>
    </div>
  )
}

function Step({ icon: Icon, title, text }) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
    </div>
  )
}
