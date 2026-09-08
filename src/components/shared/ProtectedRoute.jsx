import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * Protège une route selon l'authentification et, optionnellement, le rôle.
 * roles: liste des rôles autorisés (ex: ['LOCATAIRE']). Si omis, tout utilisateur connecté passe.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
