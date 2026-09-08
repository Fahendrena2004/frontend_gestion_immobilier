export const ROLE_BACKEND_TO_FRONT = {
  admin: 'ADMINISTRATEUR',
  proprietaire: 'PROPRIETAIRE',
  locataire: 'LOCATAIRE',
}

export const ROLE_FRONT_TO_BACKEND = Object.fromEntries(
  Object.entries(ROLE_BACKEND_TO_FRONT).map(([k, v]) => [v, k])
)

export function roleToFront(role) {
  return ROLE_BACKEND_TO_FRONT[role] ?? role
}

export function roleToBackend(role) {
  return ROLE_FRONT_TO_BACKEND[role] ?? role
}

export function statusToFront(status) {
  return status ? status.toUpperCase() : status
}

export function statusToBackend(status) {
  return status ? status.toLowerCase() : status
}

export function accountStatusToFront(isActive) {
  return isActive ? 'ACTIF' : 'SUSPENDU'
}

export function accountStatusToBackendBoolean(statutFront) {
  return statutFront === 'ACTIF'
}