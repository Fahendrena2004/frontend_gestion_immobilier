import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Search, SlidersHorizontal, MapPin, FileSearch, CalendarCheck, KeyRound,
  ChevronDown, ChevronLeft, ChevronRight, Home, ShieldCheck, Building2, Sparkles, ArrowRight, Users,
} from 'lucide-react'
import PropertyCard from '@/components/shared/PropertyCard'
import EmptyState from '@/components/shared/EmptyState'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { propertyService } from '@/services/propertyService'
import useInView from '@/hooks/useInView'

const MARQUEE_MESSAGES = [
  'Trouvez le logement qui vous correspond',
  'Votre prochain chez-vous est peut-être ici',
  'Des logements pour tous vos projets',
  'Recherchez simplement, trouvez rapidement',
  'Découvrez des logements disponibles à Fianarantsoa',
  'Comparez les logements selon vos critères',
  'Trouvez votre futur logement en quelques clics',
  'Une recherche simple pour un choix éclairé',
  'Votre logement, votre choix, votre tranquillité',
]

/* --------------------------------------------------------
   Reveal — fade-in + translate-y on scroll (CSS transition)
   -------------------------------------------------------- */
function Reveal({ children, delay = 0, className = '' }) {
  const { ref, isInView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [equipements, setEquipements] = useState([])
  const [quartiers, setQuartiers] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  // Les filtres portent des identifiants : ils sont envoyés tels quels à l'API,
  // qui filtre et pagine l'ensemble du catalogue (et non la page affichée).
  const [filters, setFilters] = useState({
    q: '',
    quartierId: '',
    typeLogementId: '',
    prixMax: '',
    piecesMin: '',
    equipements: [],
    page: 1,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Référentiels (quartiers, types, équipements) : chargés une fois.
  useEffect(() => {
    Promise.all([
      propertyService.listEquipements(),
      propertyService.listQuartiers(),
      propertyService.listTypes(),
    ])
      .then(([eq, qua, typ]) => {
        setEquipements(eq)
        setQuartiers(qua)
        setTypes(typ)
      })
      .catch((err) => setError(err.message))
  }, [])

  // Recherche : légèrement différée pour ne pas appeler l'API à chaque frappe.
  useEffect(() => {
    let annule = false
    setLoading(true)

    const handle = setTimeout(() => {
      propertyService
        .search(filters)
        .then(({ items, meta: pagination }) => {
          if (annule) return
          setProperties(items)
          setMeta(pagination)
          setError(null)
        })
        .catch((err) => {
          if (annule) return
          setProperties([])
          setMeta(null)
          setError(err.message)
        })
        .finally(() => {
          if (!annule) setLoading(false)
        })
    }, 300)

    return () => {
      annule = true
      clearTimeout(handle)
    }
  }, [filters])

  useEffect(() => {
    const scrollTo = location.state?.scrollTo
    if (!scrollTo) return

    const scroll = () => {
      if (scrollTo === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    const id = requestAnimationFrame(scroll)
    navigate(location.pathname, { replace: true, state: {} })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const activeFilterCount = useMemo(
    () =>
      [filters.quartierId, filters.typeLogementId, filters.prixMax, filters.piecesMin].filter(Boolean).length +
      filters.equipements.length,
    [filters]
  )

  function resetFilters() {
    setFilters({ q: '', quartierId: '', typeLogementId: '', prixMax: '', piecesMin: '', equipements: [], page: 1 })
  }

  function toggleEquipement(id) {
    setFilters((f) => ({
      ...f,
      equipements: f.equipements.includes(id) ? f.equipements.filter((e) => e !== id) : [...f.equipements, id],
      page: 1,
    }))
  }

  return (
    <div>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-brand-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(189,143,52,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="animate-fade-in-up flex items-center gap-2 text-sm font-medium text-gold-300">
              <MapPin className="h-4 w-4" /> Fianarantsoa, Madagascar
            </p>
            <h1 className="animate-fade-in-up animate-delay-100 mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              Trouvez votre prochain logement, sans le détour du bouche-à-oreille.
            </h1>
            <p className="animate-fade-in-up animate-delay-200 mt-4 max-w-xl text-base text-brand-100/80">
              Toutes les annonces vérifiées de Fianarantsoa, centralisées en un seul endroit — recherchez,
              visitez et louez en toute transparence.
            </p>
          </div>

          <div className="animate-fade-in-up animate-delay-300 mt-8 rounded-xl bg-white p-3 shadow-2xl sm:flex sm:items-center sm:gap-2 sm:p-2">
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search className="h-5 w-5 shrink-0 text-ink-400" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
                placeholder="Quartier, type de logement, mot-clé…"
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[{ id: '', libelle: 'Tous' }, ...types].map((t) => {
              const actif = filters.typeLogementId === t.id
              return (
                <button
                  key={t.id || 'tous'}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => setFilters((f) => ({ ...f, typeLogementId: t.id, page: 1 }))}
                  className={
                    'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
                    (actif
                      ? 'bg-gold-500 text-brand-900'
                      : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25')
                  }
                >
                  {t.libelle}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          MARQUEE — messages marketing
          ============================================================ */}
      <div className="overflow-hidden bg-gold-500 h-10 flex items-center">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...MARQUEE_MESSAGES, ...MARQUEE_MESSAGES].map((msg, i) => (
            <span key={i} className="mx-4 text-sm font-medium text-ink-900">
              {msg} <span className="ml-4 text-ink-900/40">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================
          LOGEMENTS — Résultats de recherche
          ============================================================ */}
      <section id="nos-logements" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {showFilters && (
          <Reveal>
            <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Quartier"
                value={filters.quartierId}
                onChange={(e) => setFilters((f) => ({ ...f, quartierId: e.target.value, page: 1 }))}
              >
                <option value="">Tous les quartiers</option>
                {quartiers.map((q) => <option key={q.id} value={q.id}>{q.nom}</option>)}
              </Select>
              <Select
                label="Type de logement"
                value={filters.typeLogementId}
                onChange={(e) => setFilters((f) => ({ ...f, typeLogementId: e.target.value, page: 1 }))}
              >
                <option value="">Tous les types</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
              </Select>
              <Input
                label="Prix maximum (Ar/mois)"
                type="number"
                placeholder="ex : 500000"
                value={filters.prixMax}
                onChange={(e) => setFilters((f) => ({ ...f, prixMax: e.target.value, page: 1 }))}
              />
              <Select label="Pièces minimum" value={filters.piecesMin} onChange={(e) => setFilters((f) => ({ ...f, piecesMin: e.target.value, page: 1 }))}>
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
                      aria-pressed={filters.equipements.includes(eq.id)}
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

              {activeFilterCount > 0 && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </Reveal>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            {loading ? 'Recherche en cours…' : formatResultCount(meta, properties.length)}
          </h2>
        </div>

        {error && (
          <Alert
            title="Impossible de charger les logements"
            message={error}
            className="mb-6"
          >
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setFilters((f) => ({ ...f }))}
            >
              Réessayer
            </Button>
          </Alert>
        )}

        {loading && properties.length === 0 && <LoadingState label="Recherche des logements…" />}

        {!loading && !error && properties.length === 0 && (
          <EmptyState
            icon={FileSearch}
            title="Aucun logement ne correspond à votre recherche"
            description="Essayez d'élargir vos critères : quartier, prix ou équipements."
            action={
              activeFilterCount > 0 ? (
                <Button variant="outline" onClick={resetFilters}>Réinitialiser les filtres</Button>
              ) : null
            }
          />
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <Reveal key={property.id} delay={Math.min(index * 50, 200)}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>

        {meta && meta.last_page > 1 && (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1}
              onClick={() => {
                setFilters((f) => ({ ...f, page: f.page - 1 }))
                document.getElementById('nos-logements')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <p className="text-sm text-ink-500">
              Page {meta.current_page} sur {meta.last_page} — {meta.total} logement{meta.total > 1 ? 's' : ''} au total
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => {
                setFilters((f) => ({ ...f, page: f.page + 1 }))
                document.getElementById('nos-logements')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      {/* ============================================================
          COMMENT ÇA MARCHE
          ============================================================ */}
      <section id="comment-ca-marche" className="border-t border-ink-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Comment ça marche</h2>
            <p className="mt-2 text-ink-500">Trouvez votre logement idéal en 3 étapes simples</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Reveal delay={0}>
              <Step number={1} icon={Search} title="Recherchez" text="Filtrez les annonces par quartier, prix, type et équipements. Trouvez exactement ce que vous cherchez." />
            </Reveal>
            <Reveal delay={100}>
              <Step number={2} icon={CalendarCheck} title="Visitez" text="Envoyez une demande de visite, organisez un rendez-vous avec le propriétaire directement en ligne." />
            </Reveal>
            <Reveal delay={200}>
              <Step number={3} icon={KeyRound} title="Emménagez" text="Signez le contrat, suivez vos factures et vos paiements en toute sécurité depuis votre espace." />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          POURQUOI NOUS
          ============================================================ */}
      <section className="border-t border-ink-100 bg-ink-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Pourquoi TokoFianar ?</h2>
            <p className="mt-2 text-ink-500">Une plateforme conçue pour simplifier la location à Fianarantsoa</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal delay={0}>
              <AdvantageCard icon={ShieldCheck} title="Annonces vérifiées" text="Chaque annonce est examinée par notre équipe avant publication." />
            </Reveal>
            <Reveal delay={75}>
              <AdvantageCard icon={Building2} title="Centralisé" text="Tous les logements disponibles de Fianarantsoa en un seul endroit." />
            </Reveal>
            <Reveal delay={150}>
              <AdvantageCard icon={Sparkles} title="Expérience moderne" text="Recherche intuitive, visites en ligne, suivi des paiements." />
            </Reveal>
            <Reveal delay={200}>
              <AdvantageCard icon={Users} title="Communauté locale" text="Développé spécialement pour les besoins de Fianarantsoa." />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          ESPACE PROPRIÉTAIRE
          ============================================================ */}
      <section id="espace-proprietaire" className="border-t border-ink-100 bg-brand-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Vous êtes propriétaire ?
              </h2>
              <p className="mt-3 max-w-lg text-brand-200">
                Publiez votre bien sur TokoFianar et trouvez des locataires fiables. Gérez vos annonces,
                vos demandes et vos paiements depuis un seul espace.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/proprietaire/logements/nouveau">
                  <Button variant="primary" size="lg" className="bg-gold-500 text-brand-900 hover:bg-gold-600">
                    Publier un logement <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/inscription">
                  <Button variant="outline" size="lg" className="border-brand-400 text-black hover:bg-brand-600 hover:text-white">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-700/50 sm:h-32 sm:w-32">
                <Home className="h-12 w-12 text-gold-400 sm:h-16 sm:w-16" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ
          ============================================================ */}
      <section id="faq" className="border-t border-ink-100 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Questions fréquentes</h2>
            <p className="mt-2 text-ink-500">Trouvez rapidement les réponses à vos questions</p>
          </div>
          <div className="mt-10 flex flex-col gap-3">
            {FAQ_ITEMS.map((item, i) => (
              <Reveal key={i} delay={Math.min(i * 50, 200)}>
                <FaqItem question={item.q} answer={item.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * Libellé du nombre de résultats. `meta.total` porte sur l'ensemble des
 * logements correspondant aux filtres, pas seulement sur la page affichée.
 */
function formatResultCount(meta, pageCount) {
  const total = meta?.total ?? pageCount
  if (total === 0) return 'Aucun logement disponible'
  return `${total} logement${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}`
}

/* --------------------------------------------------------
   DATA
   -------------------------------------------------------- */
const FAQ_ITEMS = [
  {
    q: 'Comment se passe le paiement du loyer ?',
    a: "Vous déclarez votre paiement directement sur la plateforme (Mvola, Airtel Money, Orange Money, espèces ou virement), avec une preuve à l'appui. Un administrateur le valide, et une quittance est générée automatiquement une fois le paiement confirmé.",
  },
  {
    q: 'Comment est vérifiée une annonce avant publication ?',
    a: "Chaque annonce déposée par un propriétaire est examinée par notre équipe avant d'être visible publiquement, afin de limiter les fausses annonces et les doublons.",
  },
  {
    q: "Puis-je visiter un logement avant de m'engager ?",
    a: 'Oui. Vous envoyez une demande de visite depuis la fiche du logement, le propriétaire vous propose une date, que vous pouvez confirmer ou annuler directement depuis votre espace.',
  },
  {
    q: 'Que se passe-t-il pour la caution ?',
    a: 'Le montant de la caution est précisé dans les conditions du contrat de location, établies avec le propriétaire au moment de la signature.',
  },
  {
    q: 'Puis-je annuler une demande ou une visite ?',
    a: "Oui, tant qu'elle est encore en attente de traitement, vous pouvez l'annuler à tout moment depuis votre espace personnel.",
  },
]

/* --------------------------------------------------------
   COMPOSANTS LOCAUX
   -------------------------------------------------------- */
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-lg border border-ink-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-ink-900">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-ink-100 px-5 py-4 text-sm text-ink-600">
          {answer}
        </div>
      )}
    </div>
  )
}

function Step({ number, icon: Icon, title, text }) {
  return (
    <div className="relative text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Icon className="h-6 w-6" />
      </div>
      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
        {number}
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500 leading-relaxed">{text}</p>
    </div>
  )
}

function AdvantageCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-sm font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{text}</p>
    </div>
  )
}