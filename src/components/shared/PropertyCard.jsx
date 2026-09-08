import { Link } from 'react-router-dom'
import { BedDouble, MapPin, Ruler } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatMoney } from '@/lib/utils'

export default function PropertyCard({ property, actions }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/logements/${property.id}`} className="block">
        <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900">
          <span className="font-display text-sm font-medium tracking-wide text-brand-100/80">
            {property.type}
          </span>
          <div className="absolute left-3 top-3">
            <StatusBadge status={property.statut} />
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link to={`/logements/${property.id}`}>
            <h3 className="font-display text-base font-semibold text-ink-900 hover:text-brand-700">
              {property.titre}
            </h3>
          </Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
            <MapPin className="h-3.5 w-3.5" />
            {property.quartier}, Fianarantsoa
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-ink-500">
          <span className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" /> {property.pieces} pièce{property.pieces > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-4 w-4" /> {property.surface} m²
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-display text-lg font-semibold text-brand-800">
            {formatMoney(property.prix)}
            <span className="text-xs font-normal text-ink-500"> /mois</span>
          </p>
          {actions}
        </div>
      </div>
    </Card>
  )
}
