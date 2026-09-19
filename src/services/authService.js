import api, { setToken } from '@/lib/axios'
import { accountStatusToFront, roleToBackend, roleToFront } from '@/lib/enums'

/**
 * Module Auth + Users de l'API.
 *   POST /auth/register, POST /auth/login, POST /auth/logout, GET /auth/me
 *   GET|PUT /users/profile, PUT /users/password
 */

const USER_KEY = 'toko_fianar_user'

/** Traduit l'utilisateur renvoyé par l'API vers le vocabulaire du frontend. */
export function mapUser(user) {
  if (!user) return null
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
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.token)
    return { user: mapUser(data.user), token: data.token }
  },

  /**
   * payload : { nom, email, password, passwordConfirmation, telephone, cin,
   *             profession?, adresse?, role: 'LOCATAIRE'|'PROPRIETAIRE' }
   */
  async register(payload) {
    const { data } = await api.post('/auth/register', {
      name: payload.nom,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
      telephone: payload.telephone,
      cin: payload.cin,
      profession: payload.profession || null,
      adresse: payload.adresse || null,
      role: roleToBackend(payload.role),
    })
    setToken(data.token)
    return { user: mapUser(data.user), token: data.token }
  },

  /** Profil de l'utilisateur connecté, source de vérité au démarrage. */
  async me() {
    const { data } = await api.get('/auth/me')
    return mapUser(data)
  },

  /** payload : { nom, telephone, cin, profession?, adresse?, avatar? } */
  async updateProfile(payload) {
    // L'API n'accepte que ces champs ; l'e-mail et le rôle ne sont pas modifiables.
    const body = {}
    if (payload.nom !== undefined) body.name = payload.nom
    if (payload.telephone !== undefined) body.telephone = payload.telephone
    if (payload.cin !== undefined) body.cin = payload.cin
    if (payload.avatar !== undefined) body.avatar = payload.avatar
    if (payload.profession !== undefined) body.profession = payload.profession
    if (payload.adresse !== undefined) body.adresse = payload.adresse

    const { data } = await api.put('/users/profile', body)
    return mapUser(data)
  },

  async changePassword({ currentPassword, newPassword, newPasswordConfirmation }) {
    const response = await api.put('/users/password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    })
    return response.apiMessage
  },

  /**
   * Révoque le jeton côté serveur puis nettoie le stockage local.
   * On nettoie dans tous les cas : un serveur injoignable ne doit pas
   * empêcher l'utilisateur de se déconnecter.
   */
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // jeton déjà invalide ou serveur indisponible : sans conséquence
    } finally {
      setToken(null)
      localStorage.removeItem(USER_KEY)
    }
  },
}
