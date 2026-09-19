import api from '@/lib/axios'
import { statusToFront } from '@/lib/enums'
import { financeService } from '@/services/financeService'

/**
 * Module Locations de l'API.
 *   GET  /locations                    (locataire : les siennes, propriétaire : celles de ses biens)
 *   POST /locations                    (propriétaire, depuis une demande acceptée)
 *   GET  /locations/{id}/contrat-pdf   (téléchargement du contrat)
 */

function mapContrat(c) {
  if (!c) return null
  return {
    id: c.id,
    dateSignature: c.date_signature,
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
    logementTitre: loc.logement?.titre ?? null,
    quartier: loc.logement?.quartier?.nom ?? null,
    locataireId: loc.locataire_id,
    locataireNom: loc.locataire?.name ?? null,
    demandeId: loc.demande_id,
    dateDebut: loc.date_debut,
    dateFin: loc.date_fin,
    statut: statusToFront(loc.statut),
    contrat: mapContrat(loc.contrat),
  }
}

export const contractService = {
  async listLocations() {
    const { data } = await api.get('/locations')
    return (data || []).map(mapLocation)
  },

  /**
   * Location courante du locataire, complétée de ses factures et paiements.
   * Renvoie `null` si l'utilisateur n'a aucune location.
   */
  async getMaLocationActive() {
    const locations = await this.listLocations()
    const location = locations.find((l) => l.statut === 'EN_COURS') || locations[0] || null

    if (!location) return null

    const [factures, paiements] = await Promise.all([
      financeService.listFactures(location.id),
      financeService.listPaiements(location.id),
    ])

    return { ...location, factures, paiements }
  },

  /** Le téléchargement porte sur l'identifiant de la LOCATION. */
  async downloadContratPdf(locationId) {
    const { data } = await api.get(`/locations/${locationId}/contrat-pdf`, {
      responseType: 'blob',
    })
    return data
  },

  /**
   * Crée la location et son contrat à partir d'une demande acceptée.
   * L'API génère au passage la première facture.
   * payload : { demandeId, dateDebut, montantLoyer, montantCaution?, conditions? }
   */
  async createLocation(payload) {
    const { data } = await api.post('/locations', {
      demande_id: payload.demandeId,
      date_debut: payload.dateDebut,
      montant_loyer: payload.montantLoyer,
      montant_caution: payload.montantCaution ?? null,
      conditions: payload.conditions || null,
    })
    return mapLocation(data)
  },
}
