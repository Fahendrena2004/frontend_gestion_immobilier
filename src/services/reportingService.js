import api from '@/lib/axios'

/**
 * Statistiques d'administration.
 * Il n'y a pas de module Reporting dédié côté API : tout vient de
 * GET /administration/dashboard-stats (DashboardController).
 */

function mapStats(s) {
  const logementsParStatut = s.logements_par_statut || {}
  const logementsParModeration = s.logements_par_moderation || {}

  return {
    totalLogements: Object.values(logementsParStatut).reduce((total, n) => total + n, 0),
    logementsDisponibles: logementsParStatut.disponible || 0,
    logementsLoues: logementsParStatut.loue || 0,
    logementsParStatut,
    logementsParModeration,
    annoncesAModerer: logementsParModeration.en_attente || 0,
    demandesEnAttente: s.demandes_en_attente ?? 0,
    paiementsEnAttenteVerification: s.paiements_en_attente ?? 0,
    revenusDuMois: s.revenus_mois_courant ?? 0,
    utilisateursTotal: s.utilisateurs_total ?? 0,
    usersParRole: s.users_par_role || {},
    totalLocations: s.locations_actives ?? 0,
    // Séries mensuelles : [{ mois: 'sept.', periode: '2026-09', valeur: 11 }]
    evolutionDemandes: s.demandes_par_mois || [],
    evolutionRevenus: s.revenus_par_mois || [],
  }
}

export const reportingService = {
  async getDashboardStats() {
    const { data } = await api.get('/administration/dashboard-stats')
    return mapStats(data)
  },
}
