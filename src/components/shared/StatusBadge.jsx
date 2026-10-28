import Badge from '@/components/ui/Badge'

/**
 * Traduction des statuts de l'API vers un libellé lisible et une couleur.
 * Les clés reprennent les énumérations backend, en majuscules.
 */
const STATUS_MAP = {
  // Logement (App\Shared\Enums\LogementStatus)
  DISPONIBLE: { label: 'Disponible', variant: 'success' },
  RESERVE: { label: 'Réservé', variant: 'warning' },
  LOUE: { label: 'Loué', variant: 'brand' },
  INDISPONIBLE: { label: 'Indisponible', variant: 'neutral' },

  // Modération d'une annonce (ModerationStatus)
  EN_ATTENTE: { label: 'En attente', variant: 'warning' },
  APPROUVE: { label: 'Approuvée', variant: 'success' },
  // Également utilisé pour un compte utilisateur désactivé.
  SUSPENDU: { label: 'Suspendu', variant: 'danger' },
  SUPPRIME: { label: 'Supprimée', variant: 'neutral' },

  // Demande de location (DemandeStatus)
  ACCEPTEE: { label: 'Acceptée', variant: 'success' },
  REFUSEE: { label: 'Refusée', variant: 'danger' },
  ANNULEE: { label: 'Annulée', variant: 'neutral' },

  // Visite (VisiteStatus)
  DEMANDEE: { label: 'Demandée', variant: 'warning' },
  PROPOSEE: { label: 'Créneau proposé', variant: 'warning' },
  CONFIRMEE: { label: 'Confirmée', variant: 'success' },
  REALISEE: { label: 'Réalisée', variant: 'brand' },

  // Facture (FactureStatus, traduit par financeService)
  PAYEE: { label: 'Payée', variant: 'success' },
  EN_RETARD: { label: 'En retard', variant: 'danger' },
  IMPAYEE: { label: 'À régler', variant: 'warning' },

  // Paiement (PaymentStatus, traduit par financeService)
  EN_ATTENTE_VERIFICATION: { label: 'À vérifier', variant: 'warning' },
  VALIDE: { label: 'Validé', variant: 'success' },
  REJETE: { label: 'Rejeté', variant: 'danger' },

  // Location (LocationStatus)
  EN_COURS: { label: 'En cours', variant: 'brand' },
  TERMINEE: { label: 'Terminée', variant: 'neutral' },
  RENOUVELEE: { label: 'Renouvelée', variant: 'brand' },
  RESILIEE: { label: 'Résiliée', variant: 'danger' },

  // Compte utilisateur
  ACTIF: { label: 'Actif', variant: 'success' },
}

export default function StatusBadge({ status, className }) {
  if (!status) return null

  const config = STATUS_MAP[status] || { label: status, variant: 'neutral' }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
