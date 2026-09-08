import api from '@/lib/axios'
import { USE_MOCK, mockResolve } from '@/lib/mock'
import { mockStats } from '@/data/mockData'

/**
 * Client du module Reporting.
 * Pas de module backend dédié : les statistiques admin viennent de
 * GET /administration/dashboard-stats (DashboardController).
 */

function mapStats(s) {
  const logementsParStatut = s.logements_par_statut || {}
  return {
    totalLogements: Object.values(logementsParStatut).reduce((a, b) => a + b, 0),
    logementsDisponibles: logementsParStatut.disponible || 0,
    demandesEnAttente: s.demandes_en_attente ?? 0,
    paiementsEnAttenteVerification: s.paiements_en_attente ?? 0,
    revenusDuMois: s.revenus_mois_courant ?? 0,
    usersParRole: s.users_par_role || {},
    logementsParStatut: logementsParStatut,
    logementsParModeration: s.logements_par_moderation || {},
    totalLocations: logementsParStatut.loue || 0,
    evolutionDemandes: [],
  }
}

export const reportingService = {
  async getDashboardStats() {
    if (USE_MOCK) return mockResolve(mockStats)
    const { data } = await api.get('/administration/dashboard-stats')
    return mapStats(data)
  },

  async exportRapport(type) {
    if (USE_MOCK) return mockResolve({ url: '#' })
    return Promise.reject({
      status: 501,
      message: "L'export de rapports n'est pas encore disponible côté serveur.",
    })
  },
}