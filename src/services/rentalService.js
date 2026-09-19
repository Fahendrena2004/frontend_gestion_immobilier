import api from '@/lib/axios'
import { statusToBackend, statusToFront } from '@/lib/enums'

/**
 * Modules Demandes & Visites de l'API.
 *   GET   /demandes                 (locataire : les siennes, propriétaire : celles de ses logements)
 *   POST  /demandes                 (locataire)
 *   PATCH /demandes/{id}/status     { statut: acceptee|refusee|annulee }
 *   GET   /visites
 *   POST  /visites                  (locataire)
 *   PATCH /visites/{id}/status      { statut: proposee|confirmee|annulee|realisee, date_proposee?, resultat? }
 *
 * Transitions autorisées côté serveur :
 *   demandee  -> proposee (propriétaire) | annulee (les deux)
 *   proposee  -> confirmee (locataire)   | annulee (les deux)
 *   confirmee -> realisee (propriétaire) | annulee (les deux)
 */

function mapDemande(d) {
  return {
    id: d.id,
    logementId: d.logement_id,
    logementTitre: d.logement?.titre ?? null,
    logementPrix: d.logement?.loyer != null ? Number(d.logement.loyer) : null,
    logementCaution: d.logement?.caution != null ? Number(d.logement.caution) : null,
    locataireId: d.locataire_id,
    locataireNom: d.locataire?.name ?? null,
    locataireEmail: d.locataire?.email ?? null,
    locataireTelephone: d.locataire?.telephone ?? null,
    message: d.message,
    statut: statusToFront(d.statut),
    dateEnvoi: d.created_at,
  }
}

function mapVisite(v) {
  return {
    id: v.id,
    logementId: v.logement_id,
    logementTitre: v.logement?.titre ?? null,
    locataireId: v.locataire_id,
    locataireNom: v.locataire?.name ?? null,
    dateProposee: v.date_proposee,
    statut: statusToFront(v.statut),
    // `resultat` est un texte libre saisi par le propriétaire, pas un statut :
    // il est affiché tel quel.
    resultat: v.resultat || null,
    dateDemande: v.created_at,
  }
}

export const rentalService = {
  // --- Demandes de location ---

  async listDemandes(filters = {}) {
    const { data } = await api.get('/demandes', { params: filters })
    return (data || []).map(mapDemande)
  },

  /**
   * Demandes du propriétaire enrichies de l'identifiant de la location déjà
   * créée, pour savoir si le bouton « Créer le contrat » a encore un sens.
   */
  async listDemandesWithLocation(filters = {}) {
    const [demandes, locationsResponse] = await Promise.all([
      this.listDemandes(filters),
      api.get('/locations'),
    ])

    const locationParDemande = {}
    for (const location of locationsResponse.data || []) {
      if (location.demande_id) locationParDemande[location.demande_id] = location.id
    }

    return demandes.map((d) => ({ ...d, locationId: locationParDemande[d.id] ?? null }))
  },

  async createDemande({ logementId, message }) {
    const { data } = await api.post('/demandes', {
      logement_id: logementId,
      message: message || null,
    })
    return mapDemande(data)
  },

  async cancelDemande(id) {
    const { data } = await api.patch(`/demandes/${id}/status`, { statut: 'annulee' })
    return mapDemande(data)
  },

  /** decision : 'ACCEPTEE' | 'REFUSEE' */
  async respondDemande(id, decision) {
    const { data } = await api.patch(`/demandes/${id}/status`, {
      statut: statusToBackend(decision),
    })
    return mapDemande(data)
  },

  // --- Visites ---

  async listVisites(filters = {}) {
    const { data } = await api.get('/visites', { params: filters })
    return (data || []).map(mapVisite)
  },

  /** Seul le locataire peut demander une visite ; le serveur y associe son compte. */
  async demanderVisite(logementId) {
    const { data } = await api.post('/visites', { logement_id: logementId })
    return mapVisite(data)
  },

  /**
   * Le propriétaire propose un créneau pour une visite demandée.
   * `dateProposee` provient d'un <input type="datetime-local"> : l'API attend
   * une date postérieure à maintenant.
   */
  async proposerVisite(visiteId, dateProposee) {
    const { data } = await api.patch(`/visites/${visiteId}/status`, {
      statut: 'proposee',
      date_proposee: dateProposee,
    })
    return mapVisite(data)
  },

  /** Confirmation par le locataire du créneau proposé. */
  async confirmerVisite(id) {
    const { data } = await api.patch(`/visites/${id}/status`, { statut: 'confirmee' })
    return mapVisite(data)
  },

  async annulerVisite(id) {
    const { data } = await api.patch(`/visites/${id}/status`, { statut: 'annulee' })
    return mapVisite(data)
  },

  /** Le propriétaire clôt une visite confirmée en consignant son issue. */
  async cloturerVisite(id, resultat) {
    const { data } = await api.patch(`/visites/${id}/status`, {
      statut: 'realisee',
      resultat: resultat || null,
    })
    return mapVisite(data)
  },
}
