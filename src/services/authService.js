import api from '@/lib/axios'
import { setToken } from '@/lib/axios'
import { USE_MOCK, mockResolve } from '@/lib/mock'
import { accountStatusToFront, roleToBackend, roleToFront } from '@/lib/enums'

/**
 * Client du micro-service Auth (voir doc d'architecture — Auth Service).
 * Authentification JWT, gestion des rôles/permissions, profil utilisateur.
 */

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

export const authService = {
  async login({ email, password }) {
    if (USE_MOCK) {
      const role = email.includes('admin')
        ? 'ADMINISTRATEUR'
        : email.includes('proprio') || email.includes('proprietaire')
        ? 'PROPRIETAIRE'
        : 'LOCATAIRE'
      const user = {
        id: 'demo-user',
        nom: role === 'ADMINISTRATEUR' ? 'Admin Plateforme' : role === 'PROPRIETAIRE' ? 'Rakoto Andriamalala' : 'Nirina Andriamampianina',
        email,
        role,
      }
      setToken('demo-jwt-token')
      return mockResolve({ user, token: 'demo-jwt-token' })
    }
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.token)
    return { user: mapUser(data.user), token: data.token }
  },

  async register(payload) {
    if (USE_MOCK) {
      setToken('demo-jwt-token')
      return mockResolve({ user: { ...payload, id: 'demo-user' }, token: 'demo-jwt-token' })
    }
    const { data } = await api.post('/auth/register', {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
      telephone: payload.telephone,
      cin: payload.cin,
      profession: payload.profession,
      adresse: payload.adresse,
      role: roleToBackend(payload.role),
    })
    setToken(data.token)
    return { user: mapUser(data.user), token: data.token }
  },

  async me() {
    if (USE_MOCK) {
      const raw = localStorage.getItem('toko_fianar_user')
      return mockResolve(raw ? JSON.parse(raw) : null)
    }
    const { data } = await api.get('/auth/me')
    return mapUser(data)
  },

  async updateProfile(payload) {
    if (USE_MOCK) return mockResolve(payload)
    const allowed = ['name', 'telephone', 'cin', 'avatar', 'profession', 'adresse']
    const body = {}
    for (const key of allowed) {
      if (payload[key] !== undefined) body[key] = payload[key]
    }
    const { data } = await api.put('/users/profile', body)
    return mapUser(data)
  },

  async changePassword() {
    if (USE_MOCK) return mockResolve({ success: true })
    return Promise.reject({
      status: 501,
      message: "Le changement de mot de passe n'est pas encore disponible côté serveur.",
    })
  },

  logout() {
    if (!USE_MOCK) {
      api.post('/auth/logout').catch(() => {})
    }
    setToken(null)
    localStorage.removeItem('toko_fianar_user')
  },
}