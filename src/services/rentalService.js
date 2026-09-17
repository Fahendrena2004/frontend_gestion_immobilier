import api from '@/lib/axios'
import { USE_MOCK, mockResolve } from '@/lib/mock'
import { mockDemandes, mockVisites } from '@/data/mockData'
import { statusToBackend, statusToFront } from '@/lib/enums'

/**
 * Client du micro-service Rental (demandes de location, visites, suivi).
 * Modules Demandes & Visites — toutes les transitions passent par
 * PATCH /demandes|visites/:id/status avec { statut: '...' } en minuscules.
 */

function mapDemande(d) {
  return {
    id: d.id,
    logementId: d.logement_id,
    logementTitre: d.logement?.titre,
    logementPrix: d.logement?.loyer ? Number(d.logement.loyer) : null,
    locataireId: d.locataire_id,
    locataireNom: d.locataire?.name,
    message: d.message,
    statut: statusToFront(d.statut),
    dateEnvoi: d.created_at,
  }
}

function mapVisite(v) {
  return {
    id: v.id,
    logementId: v.logement_id,
    logementTitre: v.logement?.titre,
    locataireId: v.locataire_id,
    demandeId: v.demande_id,
    dateProposee: v.date_proposee,
    statut: statusToFront(v.statut),
    resultat: statusToFront(v.resultat),
  }
}

export const rentalService = {
  // --- Demandes de location ---
  async listDemandes(filters = {}) {
    if (USE_MOCK) return mockResolve(mockDemandes)
    const { data } = await api.get('/demandes', { params: filters })
    return (Array.isArray(data) ? data : data?.data || []).map(mapDemande)
  },

  // Récupère les locations et crée un map { demandeId -> locationId }
  async getLocationMapForUser() {
    if (USE_MOCK) return mockResolve({})
    const { data } = await api.get('/locations')
    const locations = (Array.isArray(data) ? data : data?.data || [])
    const map = {}
    locations.forEach((loc) => {
      if (loc.demande_id) map[loc.demande_id] = loc.id
    })
    return map
  },

  // Récupère les demandes enrichies avec locationId si une location existe déjà
  async listDemandesWithLocation(filters = {}) {
    const [demandes, locationMap] = await Promise.all([
      this.listDemandes(filters),
      this.getLocationMapForUser(),
    ])
    return demandes.map((d) => ({
      ...d,
      locationId: locationMap[d.id] || null,
    }))
  },

  async createDemande(payload) {
    if (USE_MOCK) return mockResolve({ ...payload, id: `dem-${Date.now()}`, statut: 'EN_ATTENTE', dateEnvoi: new Date().toISOString() })
    const { data } = await api.post('/demandes', { logement_id: payload.logementId, message: payload.message })
    return mapDemande(data)
  },

  async cancelDemande(id) {
    if (USE_MOCK) return mockResolve({ id, statut: 'ANNULEE' })
    const { data } = await api.patch(`/demandes/${id}/status`, { statut: 'annulee' })
    return mapDemande(data)
  },

  async respondDemande(id, decision) {
    // decision: 'ACCEPTEE' | 'REFUSEE'
    if (USE_MOCK) return mockResolve({ id, statut: decision })
    const { data } = await api.patch(`/demandes/${id}/status`, { statut: statusToBackend(decision) })
    return mapDemande(data)
  },

  // --- Visites ---
  async listVisites(filters = {}) {
    if (USE_MOCK) return mockResolve(mockVisites)
    const { data } = await api.get('/visites', { params: filters })
    return (Array.isArray(data) ? data : data?.data || []).map(mapVisite)
  },

  // Seul le locataire peut créer une visite (POST /visites écarte le propriétaire :
  // `locataire_id` est forcé à l'utilisateur connecté côté backend).
  async demanderVisite(logementId) {
    if (USE_MOCK) return mockResolve({ id: `vis-${Date.now()}`, logementId, statut: 'DEMANDEE' })
    const { data } = await api.post('/visites', { logement_id: logementId })
    return mapVisite(data)
  },

  // Le propriétaire propose une date. Le backend n'a pas de demande_id sur Visite :
  // on retrouve la visite correspondante via logement_id + locataire_id de la demande.
  async proposerVisite(demandeId, dateProposee) {
    if (USE_MOCK) return mockResolve({ id: `vis-${Date.now()}`, dateProposee, statut: 'PROPOSEE' })

    const { data: demandes } = await api.get('/demandes')
    const demande = demandes.find((d) => d.id === demandeId)
    if (!demande) {
      return Promise.reject({ status: 404, message: 'Demande introuvable.' })
    }

    const { data: visites } = await api.get('/visites')
    const visite = visites.find(
      (v) => v.logement_id === demande.logement_id && v.locataire_id === demande.locataire_id && v.statut === 'demandee'
    )

    if (!visite) {
      return Promise.reject({
        status: 422,
        message: "Le locataire n'a pas encore demandé de visite pour ce logement ; impossible de proposer une date pour l'instant.",
      })
    }

    const { data } = await api.patch(`/visites/${visite.id}/status`, {
      statut: 'proposee',
      date_proposee: dateProposee,
    })
    return mapVisite(data)
  },

  async confirmerVisite(id) {
    if (USE_MOCK) return mockResolve({ id, statut: 'CONFIRMEE' })
    const { data } = await api.patch(`/visites/${id}/status`, { statut: 'confirmee' })
    return mapVisite(data)
  },

  async annulerVisite(id) {
    if (USE_MOCK) return mockResolve({ id, statut: 'ANNULEE' })
    const { data } = await api.patch(`/visites/${id}/status`, { statut: 'annulee' })
    return mapVisite(data)
  },

  async renseignerResultat(id, resultat) {
    if (USE_MOCK) return mockResolve({ id, resultat })
    const { data } = await api.patch(`/visites/${id}/status`, { statut: 'realisee', resultat: statusToBackend(resultat) })
    return mapVisite(data)
  },
}