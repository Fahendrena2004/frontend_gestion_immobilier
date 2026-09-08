import api from '@/lib/axios'
import { USE_MOCK, mockResolve } from '@/lib/mock'
import { mockProperties, QUARTIERS, EQUIPEMENTS } from '@/data/mockData'

const MOCK_TYPES = ['Villa', 'Appartement', 'Studio', 'Maison', 'Duplex', 'Chambre']
import { statusToFront } from '@/lib/enums'

/**
 * Client du micro-service Property (logements, annonces, équipements, photos).
 * Routes réelles : /logements + sous-routes (module Logements Laravel).
 */

// --- Caches en mémoire (référentiels) ---
let quartiersCache = null
let typesCache = null
let equipementsCache = null

async function ensureQuartiers() {
  if (quartiersCache) return quartiersCache
  const { data } = await api.get('/logements/quartiers')
  quartiersCache = data
  return quartiersCache
}

async function ensureTypes() {
  if (typesCache) return typesCache
  const { data } = await api.get('/logements/types')
  typesCache = data
  return typesCache
}

async function ensureEquipements() {
  if (equipementsCache) return equipementsCache
  const { data } = await api.get('/logements/equipements')
  equipementsCache = (Array.isArray(data) ? data : data?.data || []).map((e) => ({ id: e.id, nom: e.libelle }))
  return equipementsCache
}

// Le formulaire frontend manipule des noms lisibles (quartier: "Isotry", type: "Villa"),
// le backend attend des IDs (quartier_id, type_logement_id).
async function resolveRefs(form) {
  const refs = {}
  if (form.quartier) {
    const quartiers = await ensureQuartiers()
    const item = quartiers.find((q) => q.nom === form.quartier)
    if (item) refs.quartier_id = item.id
  }
  if (form.type) {
    const types = await ensureTypes()
    const item = types.find((t) => t.libelle === form.type)
    if (item) refs.type_logement_id = item.id
  }
  return refs
}

async function resolveEquipementIds(equipements) {
  if (!equipements?.length) return []
  const refs = await ensureEquipements()
  return equipements.map((e) => {
    if (typeof e === 'object' && e?.id !== undefined) return e.id
    const item = refs.find((r) => r.libelle === e || r.nom === e)
    return item ? item.id : e
  })
}

function mapLogement(l) {
  const photos = (l.photos || []).map((p) => ({
    id: p.id,
    url: p.chemin,
    estPrincipale: p.est_principale,
  }))
  return {
    id: l.id,
    titre: l.titre,
    description: l.description,
    adresse: l.adresse,
    quartier: l.quartier?.nom,
    quartierId: l.quartier_id,
    type: l.type_logement?.libelle,
    typeLogementId: l.type_logement_id,
    prix: l.loyer != null ? Number(l.loyer) : null,
    caution: l.caution != null ? Number(l.caution) : null,
    pieces: l.nombre_pieces,
    surface: l.superficie != null ? Number(l.superficie) : null,
    statut: statusToFront(l.statut),
    statutModeration: statusToFront(l.statut_moderation),
    photoPrincipale: l.photo_principale || photos.find((p) => p.estPrincipale)?.url || null,
    photos,
    equipements: (l.equipements || []).map((e) => e.id),
    equipementsDetail: (l.equipements || []).map((e) => ({ id: e.id, nom: e.libelle })),
    proprietaireId: l.proprietaire_id,
    proprietaireNom: l.proprietaire?.name,
    dateAjout: l.created_at,
  }
}

export const propertyService = {
  async search(filters = {}) {
    if (USE_MOCK) {
      let results = [...mockProperties]
      if (filters.q) {
        const q = filters.q.toLowerCase()
        results = results.filter((p) => p.titre.toLowerCase().includes(q) || p.quartier.toLowerCase().includes(q))
      }
      if (filters.quartier) results = results.filter((p) => p.quartier === filters.quartier)
      if (filters.type) results = results.filter((p) => p.type === filters.type)
      if (filters.prixMax) results = results.filter((p) => p.prix <= Number(filters.prixMax))
      if (filters.piecesMin) results = results.filter((p) => p.pieces >= Number(filters.piecesMin))
      if (filters.equipements?.length) {
        results = results.filter((p) => filters.equipements.every((e) => p.equipements.includes(e)))
      }
      if (filters.statut) results = results.filter((p) => p.statut === filters.statut)
      if (filters.proprietaireId) results = results.filter((p) => p.proprietaireId === filters.proprietaireId)
      return mockResolve(results)
    }

    const params = {}
    if (filters.prixMax) params.loyer_max = filters.prixMax
    if (filters.piecesMin) params.nombre_pieces = filters.piecesMin
    const refs = await resolveRefs(filters)
    if (refs.quartier_id) params.quartier_id = refs.quartier_id
    if (refs.type_logement_id) params.type_logement_id = refs.type_logement_id

    let data
    if (filters.proprietaireId) {
      const { data: d } = await api.get('/logements/mes-annonces')
      data = d
    } else {
      const { data: d } = await api.get('/logements', { params })
      data = d
    }

    let list = (Array.isArray(data) ? data : data?.data || []).map(mapLogement)

    if (filters.q) {
      const q = filters.q.toLowerCase()
      list = list.filter(
        (p) =>
          (p.titre || '').toLowerCase().includes(q) ||
          (p.quartier || '').toLowerCase().includes(q) ||
          (p.type || '').toLowerCase().includes(q)
      )
    }
    if (filters.equipements?.length) {
      list = list.filter((p) => filters.equipements.every((e) => p.equipements.includes(e)))
    }
    if (filters.statut) {
      list = list.filter((p) => p.statut === filters.statut)
    }
    return list
  },

  async getById(id) {
    if (USE_MOCK) return mockResolve(mockProperties.find((p) => p.id === id) || null)
    const { data } = await api.get(`/logements/${id}`)
    return mapLogement(data)
  },

  async create(payload) {
    if (USE_MOCK) return mockResolve({ ...payload, id: `log-${Date.now()}`, statut: 'DISPONIBLE' })
    const body = {
      titre: payload.titre,
      description: payload.description,
      adresse: payload.adresse,
      superficie: payload.surface,
      nombre_pieces: payload.pieces,
      loyer: payload.prix,
      caution: payload.caution,
      ...(await resolveRefs(payload)),
      equipements: await resolveEquipementIds(payload.equipements),
    }
    const { data } = await api.post('/logements', body)
    return mapLogement(data)
  },

  async update(id, payload) {
    if (USE_MOCK) return mockResolve({ ...payload, id })
    const body = {
      titre: payload.titre,
      description: payload.description,
      adresse: payload.adresse,
      superficie: payload.surface,
      nombre_pieces: payload.pieces,
      loyer: payload.prix,
      caution: payload.caution,
      ...(await resolveRefs(payload)),
    }
    if (payload.equipements) body.equipements = await resolveEquipementIds(payload.equipements)
    const { data } = await api.put(`/logements/${id}`, body)
    return mapLogement(data)
  },

  async remove(id) {
    if (USE_MOCK) return mockResolve({ success: true })
    await api.delete(`/logements/${id}`)
  },

  async uploadPhotos(id, files) {
    if (USE_MOCK) return mockResolve({ success: true })
    const form = new FormData()
    Array.from(files).forEach((f) => form.append('photo', f))
    const { data } = await api.post(`/logements/${id}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async setPhotoPrincipale(id, photoId) {
    if (USE_MOCK) return mockResolve({ success: true })
    const { data } = await api.patch(`/logements/${id}/photos/${photoId}/principale`)
    return data
  },

  async listQuartiers() {
    if (USE_MOCK) return mockResolve(QUARTIERS)
    return ensureQuartiers()
  },

  async listTypes() {
    if (USE_MOCK) return mockResolve(MOCK_TYPES)
    return ensureTypes()
  },

  async listEquipements() {
    if (USE_MOCK) return mockResolve(EQUIPEMENTS)
    return ensureEquipements()
  },
}