import api from '@/lib/axios'
import { USE_MOCK, mockResolve } from '@/lib/mock'
import { mockLocation } from '@/data/mockData'
import { statusToFront } from '@/lib/enums'
import { financeService } from '@/services/financeService'

/**
 * Client du micro-service Contract (contrats de location).
 * Routes réelles : GET /locations (liste avec contrat imbriqué),
 * GET /locations/:id/contrat-pdf (attendu : l'id du CONTRAT).
 */

function mapContrat(c) {
  if (!c) return null
  return {
    id: c.id,
    dateDebut: c.date_debut,
    dateFin: c.date_fin,
    loyerMensuel: c.montant_loyer != null ? Number(c.montant_loyer) : null,
    caution: c.montant_caution != null ? Number(c.montant_caution) : null,
    conditionsParticulieres: c.conditions,
  }
}

function mapLocation(loc) {
  return {
    id: loc.id,
    logementId: loc.logement_id,
    logementTitre: loc.logement?.titre,
    quartier: loc.logement?.quartier?.nom,
    dateDebut: loc.date_debut,
    dateFin: loc.date_fin,
    statut: statusToFront(loc.statut),
    contrat: mapContrat(loc.contrat),
  }
}

export const contractService = {
  async getMaLocationActive() {
    if (USE_MOCK) return mockResolve(mockLocation)
    const { data } = await api.get('/locations')
    const locations = (Array.isArray(data) ? data : data?.data || []).map(mapLocation)
    const location = locations.find((l) => l.statut === 'EN_COURS') || locations[0] || null
    if (location) {
      const [factures, paiements] = await Promise.all([
        financeService.listFactures(location.id),
        financeService.listPaiements(location.id),
      ])
      location.factures = factures
      location.paiements = paiements
    }
    return location
  },

  async getContrat(locationId) {
    if (USE_MOCK) return mockResolve(mockLocation.contrat)
    const { data } = await api.get('/locations')
    const locations = (Array.isArray(data) ? data : data?.data || []).map(mapLocation)
    return locations.find((l) => l.id === locationId)?.contrat || null
  },

  // L'id attendu par le backend est celui du CONTRAT (Contrat::findOrFail($id)),
  // pas celui de la location.
  async downloadContratPdf(contratId) {
    if (USE_MOCK) return mockResolve({ url: '#' })
    const { data } = await api.get(`/locations/${contratId}/contrat-pdf`, { responseType: 'blob' })
    return data
  },
}