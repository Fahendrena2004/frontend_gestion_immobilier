import { Link } from 'react-router-dom'
import { BedDouble, MapPin, Ruler, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatMoney } from '@/lib/utils'

export default function PropertyCard({ property, actions }) {
  const isAvailable = property.statut === 'DISPONIBLE'

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <Link to={`/logements/${property.id}`} className="block">
        <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900">
          {property.photoPrincipale ? (
            <img
              src={property.photoPrincipale}
              alt={property.titre}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-display text-sm font-medium tracking-wide text-brand-100/80">
              {property.type}
            </span>
          )}
          <div className="absolute left-3 top-3">
            <StatusBadge status={property.statut} />
          </div>
          {isAvailable && (
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                Disponible
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link to={`/logements/${property.id}`}>
            <h3 className="font-display text-base font-semibold text-ink-900 group-hover:text-brand-700 transition-colors">
              {property.titre}
            </h3>
          </Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {property.quartier}, Fianarantsoa
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-ink-500">
          <span className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" /> {property.pieces} pièce{property.pieces > 1 ? 's' : ''}
          </span>
          {property.surface && (
            <span className="flex items-center gap-1">
              <Ruler className="h-4 w-4" /> {property.surface} m²
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-2 border-t border-ink-100">
          <div>
            <p className="font-display text-lg font-bold text-brand-800">
              {formatMoney(property.prix)}
            </p>
            <p className="text-xs text-ink-400">par mois</p>
          </div>
          <Link
            to={`/logements/${property.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Voir le bien
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {actions}
      </div>
    </Card>
  )
}
