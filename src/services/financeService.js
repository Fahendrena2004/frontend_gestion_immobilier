import api from '@/lib/axios'
import { USE_MOCK, mockResolve } from '@/lib/mock'
import { mockLocation } from '@/data/mockData'

/**
 * Client du micro-service Finance (factures, paiements, quittances).
 * Routes réelles : préfixe /finances (module Finances Laravel).
 */

// --- Cache des modes de paiement (référentiel {id, libelle, actif}) ---
let modesCache = null

// Statuts côté UI (vocabulaire des pages/badges) : les valeurs backend
// (impayee/declare/...) sont traduites vers le vocabulaire métier du frontend.
function factureStatusToFront(statut) {
  if (statut === 'payee') return 'PAYEE'
  if (statut === 'impayee' || statut === 'en_retard') return 'EN_ATTENTE'
  return statut ? statut.toUpperCase() : statut
}

function paiementStatusToFront(statut) {
  if (statut === 'declare') return 'EN_ATTENTE_VERIFICATION'
  if (statut === 'valide') return 'VALIDE'
  if (statut === 'rejete') return 'REJETE'
  return statut ? statut.toUpperCase() : statut
}

async function ensureModes() {
  if (modesCache) return modesCache
  const { data } = await api.get('/finances/modes-paiement')
  modesCache = data
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
  }
}

function mapPaiement(p) {
  return {
    id: p.id,
    factureId: p.facture_id,
    montant: p.montant != null ? Number(p.montant) : null,
    mode: p.mode_paiement?.libelle,
    modePaiementId: p.mode_paiement_id,
    reference: p.reference,
    statut: paiementStatusToFront(p.statut),
    datePaiement: p.date_paiement,
    locataireNom: p.facture?.location?.locataire?.name,
    logementTitre: p.facture?.location?.logement?.titre,
    quittanceId: p.quittance?.id,
  }
}

export const financeService = {
  async listFactures(locationId) {
    if (USE_MOCK) return mockResolve(mockLocation.factures)
    const { data } = await api.get('/finances/factures')
    let factures = (Array.isArray(data) ? data : data?.data || []).map(mapFacture)
    if (locationId) factures = factures.filter((f) => f.locationId === locationId)
    return factures
  },

  async listPaiements(locationId) {
    if (USE_MOCK) return mockResolve(mockLocation.paiements)
    const { data } = await api.get('/finances/paiements', {
      params: locationId ? { location_id: locationId } : {},
    })
    return (Array.isArray(data) ? data : data?.data || []).map(mapPaiement)
  },

  async declarerPaiement({ factureId, montant, mode, reference, preuve }) {
    if (USE_MOCK) {
      return mockResolve({
        id: `pai-${Date.now()}`, factureId, montant, mode, reference,
        statut: 'EN_ATTENTE_VERIFICATION', datePaiement: new Date().toISOString(),
      })
    }
    const modes = await ensureModes()
    const modeFound = modes.find((m) => m.libelle === mode)
    if (!modeFound) {
      return Promise.reject({ status: 422, message: `Mode de paiement inconnu : ${mode}` })
    }
    const form = new FormData()
    form.append('facture_id', factureId)
    form.append('mode_paiement_id', modeFound.id)
    form.append('montant', montant)
    if (reference) form.append('reference', reference)
    if (preuve) form.append('preuve', preuve)
    const { data } = await api.post('/finances/paiements', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return mapPaiement(data)
  },

  // Le {id} attendu par le backend est celui de la QUITTANCE (Quittance::findOrFail), pas du paiement.
  async downloadQuittance(quittanceId) {
    if (USE_MOCK) return mockResolve({ url: '#' })
    const { data } = await api.get(`/finances/quittances/${quittanceId}/pdf`, { responseType: 'blob' })
    return data
  },

  // --- Côté administrateur ---
  async listPaiementsAVerifier() {
    if (USE_MOCK) {
      return mockResolve([
        { id: 'pai-10', locataireNom: 'Nirina Andriamampianina', logement: 'Studio proche université', montant: 150000, mode: 'Mobile Money', reference: 'MVOLA-99321', datePaiement: '2026-09-01' },
        { id: 'pai-11', locataireNom: 'Tiana Rakotobe', logement: 'Duplex avec vue sur la ville', montant: 720000, mode: 'Virement bancaire', reference: 'BFV-45102', datePaiement: '2026-09-02' },
      ])
    }
    const { data } = await api.get('/finances/paiements', { params: { statut: 'declare' } })
    return (Array.isArray(data) ? data : data?.data || []).map((p) => ({
      ...mapPaiement(p),
      logement: p.facture?.location?.logement?.titre,
    }))
  },

  async verifierPaiement(id, decision) {
    // decision: 'VALIDE' | 'REJETE'
    if (USE_MOCK) return mockResolve({ id, statut: decision })
    const { data } = await api.patch(`/finances/paiements/${id}/valider`, {
      decision: decision === 'VALIDE' ? 'valider' : 'rejeter',
    })
    return mapPaiement(data)
  },

  async listModesPaiement() {
    if (USE_MOCK) return mockResolve(['Mobile Money', 'Virement bancaire', 'Espèces', 'Chèque'])
    const modes = await ensureModes()
    return modes.filter((m) => m.actif).map((m) => m.libelle)
  },
}