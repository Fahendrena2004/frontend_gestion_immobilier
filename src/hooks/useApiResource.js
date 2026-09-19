import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Charge une ressource de l'API et expose son état de façon uniforme.
 *
 *   const { data, loading, error, reload, setData } = useApiResource(
 *     () => propertyService.getById(id),
 *     [id],
 *     { initialData: null }
 *   )
 *
 * - `loading` n'est vrai que pendant le premier chargement d'un jeu de
 *   dépendances : un `reload()` ne fait pas disparaître les données affichées.
 * - Les réponses d'une requête devenue obsolète (dépendances changées,
 *   composant démonté) sont ignorées.
 */
export default function useApiResource(loader, deps = [], { initialData = null, enabled = true } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  // Le loader change à chaque rendu ; on le garde dans une ref pour ne
  // déclencher le chargement que sur les dépendances déclarées.
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const requeteCouranteRef = useRef(0)

  const executer = useCallback(async () => {
    const requete = ++requeteCouranteRef.current
    setError(null)

    try {
      const resultat = await loaderRef.current()
      if (requete !== requeteCouranteRef.current) return resultat
      setData(resultat)
      return resultat
    } catch (err) {
      if (requete === requeteCouranteRef.current) {
        setError(err?.message || 'Une erreur est survenue.')
      }
      return undefined
    } finally {
      if (requete === requeteCouranteRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    executer()
    // Le tableau de dépendances est fourni par l'appelant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  useEffect(() => () => { requeteCouranteRef.current = -1 }, [])

  return { data, setData, loading, error, setError, reload: executer }
}
