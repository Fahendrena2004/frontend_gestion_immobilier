import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { getToken, setToken } from '@/lib/axios'

const AuthContext = createContext(null)
const USER_KEY = 'toko_fianar_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Au démarrage : on affiche immédiatement l'utilisateur mémorisé pour éviter
  // un écran vide, puis on revalide le jeton auprès de l'API. Un jeton révoqué
  // (déconnexion ailleurs, compte désactivé par l'admin) vide la session.
  useEffect(() => {
    let annule = false

    if (!getToken()) {
      storeUser(null)
      setLoading(false)
      return
    }

    setUser(readStoredUser())

    authService
      .me()
      .then((profil) => {
        if (annule) return
        setUser(profil)
        storeUser(profil)
      })
      .catch(() => {
        if (annule) return
        // L'intercepteur axios a déjà purgé le jeton sur un 401.
        setToken(null)
        storeUser(null)
        setUser(null)
      })
      .finally(() => {
        if (!annule) setLoading(false)
      })

    return () => {
      annule = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const { user: connecte } = await authService.login(credentials)
    storeUser(connecte)
    setUser(connecte)
    return connecte
  }, [])

  const register = useCallback(async (payload) => {
    const { user: nouveau } = await authService.register(payload)
    storeUser(nouveau)
    setUser(nouveau)
    return nouveau
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    storeUser(null)
    await authService.logout()
  }, [])

  /** À appeler après une modification du profil pour rafraîchir l'en-tête. */
  const updateUser = useCallback((profil) => {
    setUser(profil)
    storeUser(profil)
  }, [])

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
  return ctx
}
