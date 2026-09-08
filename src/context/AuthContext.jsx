import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService } from '@/services/authService'
import { getToken } from '@/lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    const stored = localStorage.getItem('toko_fianar_user')
    if (token && stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const { user: loggedUser, token } = await authService.login(credentials)
    localStorage.setItem('toko_fianar_user', JSON.stringify(loggedUser))
    setUser(loggedUser)
    return loggedUser
  }, [])

  const register = useCallback(async (payload) => {
    const { user: newUser } = await authService.register(payload)
    localStorage.setItem('toko_fianar_user', JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
  return ctx
}
