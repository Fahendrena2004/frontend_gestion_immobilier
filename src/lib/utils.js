import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combine des classes conditionnelles et résout les conflits Tailwind. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Formate un montant en Ariary (MGA). */
export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Formate une date ISO en format lisible fr-FR. */
export function formatDate(isoString, options) {
  if (!isoString) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(isoString))
}

export function formatDateTime(isoString) {
  return formatDate(isoString, { hour: '2-digit', minute: '2-digit' })
}

/** Affiche une date façon fil d'actualité ("Publié il y a N jours", etc.). */
export function formatRelativeDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffH = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffH / 24)

  if (diffDay < 1) return "Publié aujourd'hui"
  if (diffDay < 7) return `Publié il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`

  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 4) return `Publié il y a ${diffWeek} semaine${diffWeek > 1 ? 's' : ''}`

  return `Publié le ${formatDate(isoString)}`
}

/** Initiales d'un nom complet, pour les avatars. */
export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
