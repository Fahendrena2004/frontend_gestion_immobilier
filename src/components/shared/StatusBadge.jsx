import Badge from '@/components/ui/Badge'

// Correspond à l'annexe "Statuts du système" du document de conception.
const STATUS_MAP = {
  // Logement
  DISPONIBLE: { label: 'Disponible', variant: 'success' },
  RESERVE: { label: 'Réservé', variant: 'warning' },
  LOUE: { label: 'Loué', variant: 'brand' },
  INDISPONIBLE: { label: 'Indisponible', variant: 'neutral' },
  // Demande
  EN_ATTENTE: { label: 'En attente', variant: 'warning' },
  ACCEPTEE: { label: 'Acceptée', variant: 'success' },
  REFUSEE: { label: 'Refusée', variant: 'danger' },
  ANNULEE: { label: 'Annulée', variant: 'neutral' },
  // Visite
  PROPOSEE: { label: 'Proposée', variant: 'warning' },
  CONFIRMEE: { label: 'Confirmée', variant: 'success' },
  CONCLUANTE: { label: 'Concluante', variant: 'success' },
  NON_CONCLUANTE: { label: 'Non concluante', variant: 'neutral' },
  // Paiement / facture
  PAYEE: { label: 'Payée', variant: 'success' },
  VALIDE: { label: 'Validé', variant: 'success' },
  REJETE: { label: 'Rejeté', variant: 'danger' },
  EN_ATTENTE_VERIFICATION: { label: 'À vérifier', variant: 'warning' },
  // Compte
  ACTIF: { label: 'Actif', variant: 'success' },
  SUSPENDU: { label: 'Suspendu', variant: 'danger' },
  // Location
  EN_COURS: { label: 'En cours', variant: 'brand' },
  TERMINEE: { label: 'Terminée', variant: 'neutral' },
}

export default function StatusBadge({ status, className }) {
  const config = STATUS_MAP[status] || { label: status, variant: 'neutral' }
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
