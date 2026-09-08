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

/** Initiales d'un nom complet, pour les avatars. */
export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
