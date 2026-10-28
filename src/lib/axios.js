import axios from 'axios'

/**
 * Instance Axios unique de l'application.
 *
 * Toutes les requêtes visent l'API Laravel (`VITE_API_BASE_URL`), dont les
 * réponses prennent trois formes :
 *   1. enveloppe ApiResponseTrait  -> { success, message, data }
 *   2. paginateur brut             -> { current_page, data: [...], total, ... }
 *   3. collection de ressources    -> { data: [...], links, meta }
 *
 * L'intercepteur ci-dessous les normalise pour que les services n'aient qu'une
 * seule règle à connaître : `response.data` contient la donnée utile (un tableau
 * pour les listes) et `response.meta` la pagination quand elle existe.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

const TOKEN_KEY = 'toko_fianar_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Attache le jeton Sanctum à chaque requête sortante.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Un paginateur Laravel : un tableau `data` accompagné de `current_page`. */
function isPaginator(value) {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.data) &&
    typeof value.current_page === 'number'
  )
}

function metaFromPaginator(paginator) {
  return {
    current_page: paginator.current_page,
    last_page: paginator.last_page,
    per_page: paginator.per_page,
    total: paginator.total,
  }
}

function estObjet(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Clés d'enveloppe, à ne pas remonter comme données supplémentaires. */
const CLES_ENVELOPPE = ['success', 'message', 'data', 'meta', 'links']

/**
 * Déballe le corps de la réponse et en extrait la pagination.
 * @returns {{ data: unknown, meta: object|null, message: string|null, extra: object }}
 */
function unwrap(body) {
  // 1. Paginateur renvoyé tel quel par le contrôleur : la pagination est au
  //    même niveau que `data`, elle serait perdue par le déballage générique.
  if (isPaginator(body)) {
    return { data: body.data, meta: metaFromPaginator(body), message: null, extra: {} }
  }

  if (!estObjet(body) || !('data' in body)) {
    return { data: body, meta: null, message: null, extra: {} }
  }

  // 2. Enveloppe ApiResponseTrait { success, message, data }, ressource unique
  //    { data: {...} } ou collection { data: [...], links, meta }.
  let meta = body.meta ?? null
  const message = body.message ?? null
  const extra = {}

  for (const [cle, valeur] of Object.entries(body)) {
    if (!CLES_ENVELOPPE.includes(cle)) extra[cle] = valeur
  }

  let data = body.data

  // 3. L'enveloppe peut elle-même contenir un paginateur.
  if (isPaginator(data)) {
    meta = metaFromPaginator(data)
    data = data.data
  }

  return { data, meta, message, extra }
}

api.interceptors.response.use(
  (response) => {
    // Les téléchargements (PDF) doivent rester intacts.
    if (response.config?.responseType === 'blob') return response

    const { data, meta, message, extra } = unwrap(response.data)
    response.data = data
    response.meta = meta
    response.apiMessage = message
    response.extra = extra
    return response
  },
  (error) => {
    // Jeton expiré, révoqué, ou compte désactivé : on repart de la page de
    // connexion. Les appels publics (recherche de logements) ne sont pas
    // concernés puisqu'ils ne renvoient pas 401.
    if (error.response?.status === 401) {
      setToken(null)
      localStorage.removeItem('toko_fianar_user')
      if (!window.location.pathname.startsWith('/connexion')) {
        window.location.assign('/connexion')
      }
    }
    return Promise.reject(normalizeError(error))
  }
)

/**
 * Met toutes les erreurs au même format : { status, message, errors, raw }.
 * `errors` reprend les erreurs de validation Laravel, champ par champ.
 */
function normalizeError(error) {
  const status = error.response?.status
  const data = error.response?.data

  let message = data?.message

  // 422 : on remonte le premier message de validation, plus parlant que
  // « The given data was invalid. »
  if (status === 422 && data?.errors) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first) && first[0]) message = first[0]
  }

  // 404 : Laravel expose le nom du modèle lié quand APP_DEBUG est actif.
  if (status === 404 && (!message || message.startsWith('No query results'))) {
    message = "Cette ressource n'existe pas ou n'est plus accessible."
  }

  if (!message) {
    message = error.code === 'ERR_NETWORK'
      ? "Le serveur est injoignable. Vérifiez que l'API est démarrée."
      : 'Une erreur est survenue. Veuillez réessayer.'
  }

  return {
    status,
    message,
    errors: data?.errors || null,
    raw: error,
  }
}

export default api
