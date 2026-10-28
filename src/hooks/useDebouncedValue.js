import { useEffect, useState } from 'react'

/**
 * Renvoie `valeur` après `delai` millisecondes sans nouvelle modification.
 * Utilisé pour ne pas interroger l'API à chaque frappe dans un champ de recherche.
 */
export default function useDebouncedValue(valeur, delai = 300) {
  const [valeurDifferee, setValeurDifferee] = useState(valeur)

  useEffect(() => {
    const handle = setTimeout(() => setValeurDifferee(valeur), delai)
    return () => clearTimeout(handle)
  }, [valeur, delai])

  return valeurDifferee
}
