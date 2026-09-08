import axios from 'axios'

/**
 * Instance Axios unique pour tout le frontend.
 * Toutes les requêtes passent par l'API Gateway (voir doc d'architecture
 * microservices) qui route ensuite vers le microservice Laravel concerné
 * (Auth, Property, Rental, Contract, Finance, Notification, Admin, Reporting).
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

// Attache le JWT (Auth Service) à chaque requête sortante.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Déconnexion automatique si le token est expiré/invalide (401),
// et normalisation des erreurs de validation Laravel (422).
api.interceptors.response.use(
  (response) => {
    // Désenveloppe l'enveloppe Laravel { success, message, data } (ApiResponseTrait)
    // et les collections paginées { data: [...], links, meta } afin que les services
    // puissent faire `const { data } = await api.get(...)` et recevoir la ressource utile.
    const body = response.data
    if (body && typeof body === 'object' && !(body instanceof Blob) && 'data' in body) {
      if (body.meta) response.meta = body.meta
      if (body.message) response.message = body.message
      response.data = body.data
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      setToken(null)
      if (!window.location.pathname.startsWith('/connexion')) {
        window.location.assign('/connexion')
      }
    }
    return Promise.reject(normalizeError(error))
  }
)

function normalizeError(error) {
  const status = error.response?.status
  const data = error.response?.data
  return {
    status,
    message: data?.message || "Une erreur est survenue. Veuillez réessayer.",
    errors: data?.errors || null, // erreurs de validation Laravel par champ
    raw: error,
  }
}

export default api
