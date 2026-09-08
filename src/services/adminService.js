import api from '@/lib/axios'
import { USE_MOCK, mockResolve } from '@/lib/mock'
import { mockUsers, mockProperties, EQUIPEMENTS } from '@/data/mockData'
import {
  accountStatusToBackendBoolean,
  accountStatusToFront,
  roleToBackend,
  roleToFront,
  statusToBackend,
  statusToFront,
} from '@/lib/enums'

/**
 * Client du module Admin (modération des annonces, gestion des comptes).
 * Routes réelles : /administration/logements, /administration/users/{id}/status,
 * /users et /logements/equipements (PATCH, pas PUT).
 */

const MODERATION_ACTIONS = {
  APPROUVER: 'approuve',
  SUSPENDRE: 'suspendu',
  SUPPRIMER: 'supprime',
}

function mapUser(user) {
  if (!user) return user
  return {
    id: user.id,
    nom: user.name,
    email: user.email,
    telephone: user.telephone,
    cin: user.cin,
    profession: user.profession,
    adresse: user.adresse,
    avatar: user.avatar,
    role: roleToFront(user.role),
    statut: accountStatusToFront(user.is_active),
    dateInscription: user.created_at,
  }
}

function mapAnnonce(l) {
  return {
    id: l.id,
    titre: l.titre,
    quartier: l.quartier?.nom,
    proprietaireNom: l.proprietaire?.name,
    prix: l.loyer != null ? Number(l.loyer) : null,
    statut: statusToFront(l.statut_moderation),
    type: l.type_logement?.libelle,
    surface: l.superficie,
    pieces: l.nombre_pieces,
  }
}

export const adminService = {
  async listAnnonces(filters = {}) {
    if (USE_MOCK) return mockResolve(mockProperties)
    const params = {}
    if (filters.statutModeration) params.statut_moderation = statusToBackend(filters.statutModeration)
    const { data } = await api.get('/administration/logements', { params })
    return (data?.data || []).map(mapAnnonce)
  },

  async moderateAnnonce(id, action) {
    // action: 'APPROUVER' | 'SUSPENDRE' | 'SUPPRIMER'
    if (USE_MOCK) return mockResolve({ id, action })
    const { data } = await api.patch(`/administration/logements/${id}/moderation`, {
      statut_moderation: MODERATION_ACTIONS[action],
    })
    return mapAnnonce(data)
  },

  async listUsers(filters = {}) {
    if (USE_MOCK) return mockResolve(mockUsers)
    const params = {}
    if (filters.role) params.role = roleToBackend(filters.role)
    if (filters.search) params.search = filters.search
    const { data } = await api.get('/users', { params })
    return (Array.isArray(data) ? data : data?.data || []).map(mapUser)
  },

  async toggleUserStatus(id, statut) {
    // statut: 'ACTIF' | 'SUSPENDU'
    if (USE_MOCK) return mockResolve({ id, statut })
    const { data } = await api.patch(`/administration/users/${id}/status`, {
      is_active: accountStatusToBackendBoolean(statut),
    })
    return mapUser(data)
  },

  async listEquipements() {
    if (USE_MOCK) return mockResolve(EQUIPEMENTS)
    const { data } = await api.get('/logements/equipements')
    return (Array.isArray(data) ? data : data?.data || []).map((e) => ({ id: e.id, nom: e.libelle }))
  },
}