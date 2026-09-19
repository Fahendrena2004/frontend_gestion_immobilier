import api from '@/lib/axios'
import { mapUser } from '@/services/authService'
import {
  accountStatusToBackendBoolean,
  roleToBackend,
  statusToFront,
} from '@/lib/enums'

/**
 * Module Administration de l'API (réservé au rôle admin).
 *   GET   /administration/logements                 (?statut_moderation=)
 *   PATCH /administration/logements/{id}/moderation { statut_moderation }
 *   PATCH /administration/users/{id}/status         { is_active }
 *   GET   /users                                    (?role=, ?search=)
 */

/** Action de modération -> statut attendu par l'API. */
const MODERATION_ACTIONS = {
  APPROUVER: 'approuve',
  SUSPENDRE: 'suspendu',
  SUPPRIMER: 'supprime',
}

function mapAnnonce(l) {
  return {
    id: l.id,
    titre: l.titre,
    quartier: l.quartier?.nom ?? null,
    proprietaireNom: l.proprietaire?.name ?? null,
    proprietaireEmail: l.proprietaire?.email ?? null,
    prix: l.loyer != null ? Number(l.loyer) : null,
    // Sur cet écran, le statut affiché est celui de la MODÉRATION.
    statut: statusToFront(l.statut_moderation),
    statutLogement: statusToFront(l.statut),
    type: l.type_logement?.libelle ?? null,
    surface: l.superficie != null ? Number(l.superficie) : null,
    pieces: l.nombre_pieces,
    nombrePhotos: (l.photos || []).length,
    dateAjout: l.created_at,
  }
}

export const adminService = {
  /** filters : { statutModeration: 'EN_ATTENTE'|'APPROUVE'|'SUSPENDU'|'SUPPRIME' } */
  async listAnnonces(filters = {}) {
    const params = {}
    if (filters.statutModeration) {
      params.statut_moderation = String(filters.statutModeration).toLowerCase()
    }

    const response = await api.get('/administration/logements', { params })
    return {
      items: (response.data || []).map(mapAnnonce),
      meta: response.meta || null,
    }
  },

  /** action : 'APPROUVER' | 'SUSPENDRE' | 'SUPPRIMER' */
  async moderateAnnonce(id, action) {
    const statutModeration = MODERATION_ACTIONS[action]
    if (!statutModeration) throw new Error(`Action de modération inconnue : ${action}`)

    const { data } = await api.patch(`/administration/logements/${id}/moderation`, {
      statut_moderation: statutModeration,
    })
    return mapAnnonce(data)
  },

  /** filters : { role: 'LOCATAIRE'|'PROPRIETAIRE'|'ADMINISTRATEUR', search } */
  async listUsers(filters = {}) {
    const params = {}
    if (filters.role) params.role = roleToBackend(filters.role)
    if (filters.search) params.search = filters.search

    const response = await api.get('/users', { params })
    return {
      items: (response.data || []).map(mapUser),
      meta: response.meta || null,
    }
  },

  /** statut : 'ACTIF' | 'SUSPENDU' — l'API refuse d'agir sur un autre admin. */
  async toggleUserStatus(id, statut) {
    const { data } = await api.patch(`/administration/users/${id}/status`, {
      is_active: accountStatusToBackendBoolean(statut),
    })
    return mapUser(data)
  },
}
