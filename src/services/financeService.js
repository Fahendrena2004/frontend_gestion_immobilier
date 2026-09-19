import api from '@/lib/axios'

/**
 * Module Finances de l'API.
 *   GET   /finances/factures
 *   GET   /finances/paiements            (?statut=declare, ?location_id=)
 *   POST  /finances/paiements            (locataire, multipart : preuve obligatoire)
 *   PATCH /finances/paiements/{id}/valider  (admin, { decision: valider|rejeter })
 *   GET   /finances/quittances/{id}/pdf
 *   GET   /finances/modes-paiement
 */

let modesCache = null

/**
 * Vocabulaire métier du frontend :
 *   facture impayee|en_retard -> EN_ATTENTE (une action du locataire est attendue)
 *   facture payee            -> PAYEE
 */
function factureStatusToFront(statut) {
  if (statut === 'payee') return 'PAYEE'
  if (statut === 'impayee') return 'EN_ATTENTE'
  if (statut === 'en_retard') return 'EN_RETARD'
  return statut ? statut.toUpperCase() : statut
}

function paiementStatusToFront(statut) {
  if (statut === 'declare') return 'EN_ATTENTE_VERIFICATION'
  if (statut === 'valide') return 'VALIDE'
  if (statut === 'rejete') return 'REJETE'
  return statut ? statut.toUpperCase() : statut
}

async function ensureModes() {
  if (!modesCache) {
    const { data } = await api.get('/finances/modes-paiement')
    modesCache = (data || []).map((m) => ({ id: m.id, libelle: m.libelle, actif: !!m.actif }))
  }
  return modesCache
}

function mapFacture(f) {
  return {
    id: f.id,
    locationId: f.location_id,
    numero: f.numero_facture,
    periode: f.periode,
    montant: f.montant != null ? Number(f.montant) : null,
    echeance: f.date_echeance,
    dateEmission: f.date_emission,
    statut: factureStatusToFront(f.statut),
    logementTitre: f.location?.logement?.titre ?? null,
  }
}

function mapPaiement(p) {
  return {
    id: p.id,
    factureId: p.facture_id,
    factureNumero: p.facture?.numero_facture ?? null,
    montant: p.montant != null ? Number(p.montant) : null,
    mode: p.mode_paiement?.libelle ?? null,
    modePaiementId: p.mode_paiement_id,
    reference: p.reference,
    preuveUrl: p.preuve_url ?? null,
    statut: paiementStatusToFront(p.statut),
    datePaiement: p.date_paiement,
    dateValidation: p.date_validation,
    locataireNom: p.facture?.location?.locataire?.name ?? null,
    logementTitre: p.facture?.location?.logement?.titre ?? null,
    locationId: p.facture?.location_id ?? null,
    quittanceId: p.quittance?.id ?? null,
    quittanceNumero: p.quittance?.numero_quittance ?? null,
  }
}

export const financeService = {
  /** `locationId` filtre côté client : l'API renvoie toutes les factures de l'utilisateur. */
  async listFactures(locationId) {
    const { data } = await api.get('/finances/factures')
    const factures = (data || []).map(mapFacture)
    return locationId ? factures.filter((f) => f.locationId === locationId) : factures
  },

  async listPaiements(locationId) {
    const { data } = await api.get('/finances/paiements', {
      params: locationId ? { location_id: locationId } : {},
    })
    return (data || []).map(mapPaiement)
  },

  /**
   * Déclaration d'un paiement par le locataire.
   * `preuve` (image ou PDF, 5 Mo max) est exigée par l'API.
   * `modeId` est l'identifiant du mode de paiement.
   */
  async declarerPaiement({ factureId, montant, modeId, reference, preuve }) {
    const form = new FormData()
    form.append('facture_id', factureId)
    form.append('mode_paiement_id', modeId)
    form.append('montant', montant)
    if (reference) form.append('reference', reference)
    form.append('preuve', preuve)

    const { data } = await api.post('/finances/paiements', form)
    return mapPaiement(data)
  },

  /** L'identifiant attendu est celui de la QUITTANCE, pas du paiement. */
  async downloadQuittance(quittanceId) {
    const { data } = await api.get(`/finances/quittances/${quittanceId}/pdf`, {
      responseType: 'blob',
    })
    return data
  },

  // --- Administrateur ---

  async listPaiementsAVerifier() {
    const { data } = await api.get('/finances/paiements', { params: { statut: 'declare' } })
    return (data || []).map(mapPaiement)
  },

  /** decision : 'VALIDE' | 'REJETE' */
  async verifierPaiement(id, decision) {
    const { data } = await api.patch(`/finances/paiements/${id}/valider`, {
      decision: decision === 'VALIDE' ? 'valider' : 'rejeter',
    })
    return mapPaiement(data)
  },

  /** Modes de paiement actifs, proposés au locataire. */
  async listModesPaiement() {
    const modes = await ensureModes()
    return modes.filter((m) => m.actif)
  },
}
