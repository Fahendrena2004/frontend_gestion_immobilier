import api from '@/lib/axios'
import { statusToFront } from '@/lib/enums'

/**
 * Module Logements de l'API.
 *   GET    /logements                     (public, filtré + paginé)
 *   GET    /logements/quartiers|types|equipements   (référentiels publics)
 *   GET    /logements/{id}                (public)
 *   GET    /logements/mes-annonces        (propriétaire)
 *   POST   /logements                     (propriétaire)
 *   PUT    /logements/{id}                (propriétaire)
 *   DELETE /logements/{id}                (propriétaire)
 *   POST   /logements/{id}/photos         (une photo par requête)
 *   DELETE /logements/{id}/photos/{photo}
 *   PATCH  /logements/{id}/photos/{photo}/principale
 *   PUT    /logements/{id}/equipements
 */

// --- Référentiels : chargés une fois puis gardés en mémoire ---
let quartiersCache = null
let typesCache = null
let equipementsCache = null

async function ensureQuartiers() {
  if (!quartiersCache) {
    const { data } = await api.get('/logements/quartiers')
    quartiersCache = (data || []).map((q) => ({ id: q.id, nom: q.nom, ville: q.ville }))
  }
  return quartiersCache
}

async function ensureTypes() {
  if (!typesCache) {
    const { data } = await api.get('/logements/types')
    typesCache = (data || []).map((t) => ({ id: t.id, libelle: t.libelle }))
  }
  return typesCache
}

async function ensureEquipements() {
  if (!equipementsCache) {
    const { data } = await api.get('/logements/equipements')
    equipementsCache = (data || []).map((e) => ({ id: e.id, nom: e.libelle }))
  }
  return equipementsCache
}

function mapPhoto(photo) {
  return {
    id: photo.id,
    url: photo.chemin, // l'API renvoie déjà une URL absolue
    estPrincipale: !!photo.est_principale,
  }
}

/** Traduit un logement de l'API vers le vocabulaire du frontend. */
function mapLogement(l) {
  const photos = (l.photos || []).map(mapPhoto)
  const equipements = l.equipements || []

  return {
    id: l.id,
    titre: l.titre,
    description: l.description,
    adresse: l.adresse,
    quartier: l.quartier?.nom ?? null,
    quartierId: l.quartier?.id ?? l.quartier_id ?? null,
    type: l.type_logement?.libelle ?? null,
    typeLogementId: l.type_logement?.id ?? l.type_logement_id ?? null,
    prix: l.loyer != null ? Number(l.loyer) : null,
    caution: l.caution != null ? Number(l.caution) : null,
    pieces: l.nombre_pieces,
    surface: l.superficie != null ? Number(l.superficie) : null,
    statut: statusToFront(l.statut),
    statutModeration: statusToFront(l.statut_moderation),
    photoPrincipale: l.photo_principale || photos.find((p) => p.estPrincipale)?.url || photos[0]?.url || null,
    photos,
    nombrePhotos: l.nombre_photos ?? photos.length,
    equipements: equipements.map((e) => e.id),
    equipementsDetail: equipements.map((e) => ({ id: e.id, nom: e.libelle })),
    proprietaireId: l.proprietaire?.id ?? l.proprietaire_id ?? null,
    proprietaireNom: l.proprietaire?.name ?? null,
    proprietaireEmail: l.proprietaire?.email ?? null,
    dateAjout: l.created_at,
  }
}

/** Corps commun aux création/modification d'annonce. */
function toLogementBody(payload) {
  const body = {}
  if (payload.titre !== undefined) body.titre = payload.titre
  if (payload.description !== undefined) body.description = payload.description || null
  if (payload.adresse !== undefined) body.adresse = payload.adresse || null
  if (payload.surface !== undefined && payload.surface !== '') body.superficie = Number(payload.surface)
  if (payload.pieces !== undefined && payload.pieces !== '') body.nombre_pieces = Number(payload.pieces)
  if (payload.prix !== undefined && payload.prix !== '') body.loyer = Number(payload.prix)
  if (payload.caution !== undefined) body.caution = payload.caution === '' ? null : Number(payload.caution)
  if (payload.quartierId) body.quartier_id = Number(payload.quartierId)
  if (payload.typeLogementId) body.type_logement_id = Number(payload.typeLogementId)
  if (payload.statut) body.statut = String(payload.statut).toLowerCase()
  if (Array.isArray(payload.equipements)) body.equipements = payload.equipements.map(Number)
  return body
}

export const propertyService = {
  /**
   * Recherche publique. Les filtres sont appliqués par l'API : la pagination
   * porte donc bien sur l'ensemble des résultats.
   * filters : { q, quartierId, typeLogementId, prixMax, prixMin, piecesMin, equipements[], page, perPage }
   */
  async search(filters = {}) {
    const params = {}
    if (filters.q) params.q = filters.q
    if (filters.quartierId) params.quartier_id = filters.quartierId
    if (filters.typeLogementId) params.type_logement_id = filters.typeLogementId
    if (filters.prixMin) params.loyer_min = filters.prixMin
    if (filters.prixMax) params.loyer_max = filters.prixMax
    if (filters.piecesMin) params.pieces_min = filters.piecesMin
    if (filters.equipements?.length) params.equipements = filters.equipements
    if (filters.perPage) params.per_page = filters.perPage
    params.page = Number(filters.page) || 1

    const response = await api.get('/logements', { params })
    return {
      items: (response.data || []).map(mapLogement),
      meta: response.meta || null,
    }
  },

  /** Annonces du propriétaire connecté, tous statuts de modération confondus. */
  async listMesAnnonces(filters = {}) {
    const params = { per_page: filters.perPage || 50 }
    if (filters.page) params.page = filters.page
    if (filters.statut) params.statut = String(filters.statut).toLowerCase()
    if (filters.statutModeration) params.statut_moderation = String(filters.statutModeration).toLowerCase()

    const response = await api.get('/logements/mes-annonces', { params })
    return {
      items: (response.data || []).map(mapLogement),
      meta: response.meta || null,
    }
  },

  async getById(id) {
    const { data } = await api.get(`/logements/${id}`)
    return mapLogement(data)
  },

  async create(payload) {
    const { data } = await api.post('/logements', toLogementBody(payload))
    return mapLogement(data)
  },

  async update(id, payload) {
    const { data } = await api.put(`/logements/${id}`, toLogementBody(payload))
    return mapLogement(data)
  },

  /** Change uniquement la disponibilité de l'annonce. */
  async updateStatut(id, statut) {
    const { data } = await api.put(`/logements/${id}`, { statut: String(statut).toLowerCase() })
    return mapLogement(data)
  },

  async remove(id) {
    await api.delete(`/logements/${id}`)
  },

  // --- Photos ---

  /**
   * L'API accepte une photo par requête : on les envoie donc une à une.
   * `premierePrincipale` marque la première photo envoyée comme principale
   * (utile quand le logement n'en a encore aucune).
   */
  async uploadPhotos(logementId, files, { premierePrincipale = false } = {}) {
    const photos = []

    for (const [index, file] of Array.from(files).entries()) {
      const form = new FormData()
      form.append('photo', file)
      if (premierePrincipale && index === 0) form.append('est_principale', '1')

      const { data } = await api.post(`/logements/${logementId}/photos`, form)
      photos.push(mapPhoto(data))
    }

    return photos
  },

  async deletePhoto(logementId, photoId) {
    await api.delete(`/logements/${logementId}/photos/${photoId}`)
  },

  async setPhotoPrincipale(logementId, photoId) {
    const { data } = await api.patch(`/logements/${logementId}/photos/${photoId}/principale`)
    return mapPhoto(data)
  },

  async syncEquipements(logementId, equipementIds) {
    const { data } = await api.put(`/logements/${logementId}/equipements`, {
      equipements: equipementIds.map(Number),
    })
    return (data || []).map((e) => ({ id: e.id, nom: e.libelle }))
  },

  // --- Référentiels ---
  listQuartiers: ensureQuartiers,
  listTypes: ensureTypes,
  listEquipements: ensureEquipements,
}
