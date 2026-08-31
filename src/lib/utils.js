import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Manova vola ho Ariary (ohatra: 250 000 Ar)
 */
export function formatAriary(amount) {
  if (amount === undefined || amount === null) return '0 Ar';
  return new Intl.NumberFormat('fr-MG').format(amount) + ' Ar';
}

/**
 * Manova daty ho endrika tsotra sy mazava
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
