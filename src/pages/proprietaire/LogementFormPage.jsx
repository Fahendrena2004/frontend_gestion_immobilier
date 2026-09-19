import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Save, Star, Trash2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import { propertyService } from '@/services/propertyService'

const MAX_PHOTOS = 6

const EMPTY_FORM = {
  titre: '',
  quartierId: '',
  typeLogementId: '',
  prix: '',
  pieces: 1,
  surface: '',
  caution: '',
  adresse: '',
  description: '',
  equipements: [],
}

export default function LogementFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [referentiels, setReferentiels] = useState({ quartiers: [], types: [], equipements: [] })
  const [chargement, setChargement] = useState(true)
  const [erreurChargement, setErreurChargement] = useState(null)

  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  // Photos déjà enregistrées (mode édition) et nouveaux fichiers à envoyer.
  const [photosExistantes, setPhotosExistantes] = useState([])
  const [nouvellesPhotos, setNouvellesPhotos] = useState([]) // [{ file, preview }]
  const [photoErreur, setPhotoErreur] = useState(null)
  const [photoAction, setPhotoAction] = useState(null)

  // Chargement des référentiels et, en édition, du logement à modifier.
  useEffect(() => {
    let annule = false

    async function charger() {
      setChargement(true)
      try {
        const [quartiers, types, equipements] = await Promise.all([
          propertyService.listQuartiers(),
          propertyService.listTypes(),
          propertyService.listEquipements(),
        ])
        if (annule) return
        setReferentiels({ quartiers, types, equipements })

        if (isEdit) {
          const logement = await propertyService.getById(id)
          if (annule) return
          setForm({
            titre: logement.titre ?? '',
            quartierId: logement.quartierId ?? '',
            typeLogementId: logement.typeLogementId ?? '',
            prix: logement.prix ?? '',
            pieces: logement.pieces ?? 1,
            surface: logement.surface ?? '',
            caution: logement.caution ?? '',
            adresse: logement.adresse ?? '',
            description: logement.description ?? '',
            equipements: logement.equipements ?? [],
          })
          setPhotosExistantes(logement.photos ?? [])
        } else {
          // Valeurs par défaut prises dans les référentiels réels.
          setForm((f) => ({
            ...f,
            quartierId: quartiers[0]?.id ?? '',
            typeLogementId: types[0]?.id ?? '',
          }))
        }
        setErreurChargement(null)
      } catch (err) {
        if (!annule) setErreurChargement(err.message)
      } finally {
        if (!annule) setChargement(false)
      }
    }

    charger()
    return () => { annule = true }
  }, [id, isEdit])

  // Libère les aperçus (URL.createObjectURL) au démontage.
  useEffect(
    () => () => nouvellesPhotos.forEach((p) => URL.revokeObjectURL(p.preview)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  function setChamp(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }))
    setFieldErrors((e) => (e[champ] ? { ...e, [champ]: null } : e))
  }

  function toggleEquipement(equipementId) {
    setForm((f) => ({
      ...f,
      equipements: f.equipements.includes(equipementId)
        ? f.equipements.filter((e) => e !== equipementId)
        : [...f.equipements, equipementId],
    }))
  }

  const totalPhotos = photosExistantes.length + nouvellesPhotos.length

  function handlePhotosChange(e) {
    const fichiers = Array.from(e.target.files)
    e.target.value = '' // permet de re-sélectionner le même fichier
    if (fichiers.length === 0) return

    const placesRestantes = MAX_PHOTOS - totalPhotos
    if (placesRestantes <= 0) {
      setPhotoErreur(`Vous avez atteint la limite de ${MAX_PHOTOS} photos.`)
      return
    }

    const images = fichiers.filter((f) => f.type.startsWith('image/'))
    const tropVolumineux = images.filter((f) => f.size > 5 * 1024 * 1024)

    if (images.length !== fichiers.length) {
      setPhotoErreur('Seules les images (JPG, PNG) sont acceptées.')
      return
    }
    if (tropVolumineux.length > 0) {
      setPhotoErreur('Chaque photo doit faire moins de 5 Mo.')
      return
    }
    if (images.length > placesRestantes) {
      setPhotoErreur(
        `Vous pouvez encore ajouter ${placesRestantes} photo${placesRestantes > 1 ? 's' : ''}.`
      )
      return
    }

    setNouvellesPhotos((prev) => [
      ...prev,
      ...images.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ])
    setPhotoErreur(null)
  }

  function retirerNouvellePhoto(index) {
    setNouvellesPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
    setPhotoErreur(null)
  }

  async function supprimerPhotoExistante(photoId) {
    setPhotoAction(photoId)
    setPhotoErreur(null)
    try {
      await propertyService.deletePhoto(id, photoId)
      setPhotosExistantes((prev) => prev.filter((p) => p.id !== photoId))
    } catch (err) {
      setPhotoErreur(err.message)
    } finally {
      setPhotoAction(null)
    }
  }

  async function definirPhotoPrincipale(photoId) {
    setPhotoAction(photoId)
    setPhotoErreur(null)
    try {
      await propertyService.setPhotoPrincipale(id, photoId)
      setPhotosExistantes((prev) => prev.map((p) => ({ ...p, estPrincipale: p.id === photoId })))
    } catch (err) {
      setPhotoErreur(err.message)
    } finally {
      setPhotoAction(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnregistrement(true)
    setErreur(null)
    setFieldErrors({})

    try {
      const logement = isEdit
        ? await propertyService.update(id, form)
        : await propertyService.create(form)

      // Les photos partent après la création : l'API les rattache à un logement
      // existant. La première photo d'une annonce qui n'en a pas devient la
      // photo principale.
      if (nouvellesPhotos.length > 0) {
        await propertyService.uploadPhotos(
          logement.id,
          nouvellesPhotos.map((p) => p.file),
          { premierePrincipale: photosExistantes.length === 0 }
        )
      }

      navigate('/proprietaire/logements')
    } catch (err) {
      setErreur(err.message)
      if (err.errors) {
        setFieldErrors(
          Object.fromEntries(Object.entries(err.errors).map(([champ, msgs]) => [champ, msgs[0]]))
        )
      }
      setEnregistrement(false)
    }
  }

  if (chargement) return <LoadingState label="Chargement du formulaire…" />

  if (erreurChargement) {
    return (
      <Alert title="Impossible de charger le formulaire" message={erreurChargement}>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </Alert>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">
        {isEdit ? 'Modifier le logement' : 'Ajouter un logement'}
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Renseignez les informations de votre annonce. Les champs marqués d'une{' '}
        <span className="text-brick-500">*</span> sont obligatoires.
        {!isEdit && ' Votre annonce sera publiée après validation par un administrateur.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        {erreur && <Alert title="L'annonce n'a pas pu être enregistrée" message={erreur} />}

        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Les caractéristiques principales du logement.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Titre de l'annonce *"
                required
                value={form.titre}
                error={fieldErrors.titre}
                onChange={(e) => setChamp('titre', e.target.value)}
                placeholder="ex : Villa 3 chambres avec jardin"
              />
            </div>

            <Select
              label="Quartier *"
              required
              value={form.quartierId}
              error={fieldErrors.quartier_id}
              onChange={(e) => setChamp('quartierId', e.target.value)}
            >
              <option value="">Sélectionner un quartier</option>
              {referentiels.quartiers.map((q) => (
                <option key={q.id} value={q.id}>{q.nom}</option>
              ))}
            </Select>

            <Select
              label="Type de logement *"
              required
              value={form.typeLogementId}
              error={fieldErrors.type_logement_id}
              onChange={(e) => setChamp('typeLogementId', e.target.value)}
            >
              <option value="">Sélectionner un type</option>
              {referentiels.types.map((t) => (
                <option key={t.id} value={t.id}>{t.libelle}</option>
              ))}
            </Select>

            <Input
              label="Loyer mensuel (Ar) *"
              type="number"
              min="1"
              required
              value={form.prix}
              error={fieldErrors.loyer}
              onChange={(e) => setChamp('prix', e.target.value)}
              placeholder="ex : 700000"
            />

            <Input
              label="Caution (Ar)"
              type="number"
              min="0"
              value={form.caution}
              error={fieldErrors.caution}
              onChange={(e) => setChamp('caution', e.target.value)}
              placeholder="ex : 700000"
            />

            <Input
              label="Nombre de pièces"
              type="number"
              min={1}
              value={form.pieces}
              error={fieldErrors.nombre_pieces}
              onChange={(e) => setChamp('pieces', e.target.value)}
              placeholder="ex : 3"
            />

            <Input
              label="Surface (m²)"
              type="number"
              min="1"
              value={form.surface}
              error={fieldErrors.superficie}
              onChange={(e) => setChamp('surface', e.target.value)}
              placeholder="ex : 80"
            />

            <div className="sm:col-span-2">
              <Input
                label="Adresse"
                value={form.adresse}
                error={fieldErrors.adresse}
                onChange={(e) => setChamp('adresse', e.target.value)}
                placeholder="ex : Rue de l'Indépendance, près du marché"
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                rows={5}
                value={form.description}
                error={fieldErrors.description}
                onChange={(e) => setChamp('description', e.target.value)}
                placeholder="ex : Belle villa familiale au calme, à deux pas du centre-ville, avec jardin clos et parking privé."
              />
              <p className="mt-1 text-xs text-ink-500">
                Décrivez le logement, son environnement, son accès et ses atouts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Équipements</CardTitle>
            <CardDescription>Cochez tout ce que propose le logement.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {referentiels.equipements.map((eq) => (
                <label key={eq.id} className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={form.equipements.includes(eq.id)}
                    onChange={() => toggleEquipement(eq.id)}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  />
                  {eq.nom}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>
              Jusqu'à {MAX_PHOTOS} photos (JPG ou PNG, 5 Mo maximum chacune).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {photoErreur && <Alert message={photoErreur} className="mb-4" />}

            {photosExistantes.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-ink-700">Photos publiées</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {photosExistantes.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-ink-200"
                    >
                      <img src={photo.url} alt="" className="h-full w-full object-cover" />

                      <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {!photo.estPrincipale && (
                          <button
                            type="button"
                            disabled={photoAction === photo.id}
                            onClick={() => definirPhotoPrincipale(photo.id)}
                            aria-label="Définir comme photo principale"
                            className="rounded-full bg-black/60 p-1 text-white hover:bg-gold-600"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={photoAction === photo.id}
                          onClick={() => supprimerPhotoExistante(photo.id)}
                          aria-label="Supprimer cette photo"
                          className="rounded-full bg-black/60 p-1 text-white hover:bg-brick-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {photo.estPrincipale && (
                        <span className="absolute bottom-1 left-1 rounded bg-brand-600 px-1.5 py-0.5 text-xs text-white">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 py-10 text-center transition-colors hover:border-brand-300"
              style={{ opacity: totalPhotos >= MAX_PHOTOS ? 0.5 : 1 }}
            >
              <ImagePlus className="h-6 w-6 text-ink-400" />
              <span className="text-sm font-medium text-ink-600">
                {totalPhotos === 0
                  ? 'Cliquez pour ajouter des photos'
                  : `${totalPhotos} / ${MAX_PHOTOS} photos`}
              </span>
              <span className="text-xs text-ink-400">JPG, PNG — 5 Mo maximum par fichier</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePhotosChange}
                disabled={totalPhotos >= MAX_PHOTOS}
              />
            </label>

            {nouvellesPhotos.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-ink-700">
                  À envoyer ({nouvellesPhotos.length})
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {nouvellesPhotos.map((photo, index) => (
                    <div
                      key={photo.preview}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-brand-300"
                    >
                      <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => retirerNouvellePhoto(index)}
                        aria-label="Retirer cette photo"
                        className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-brick-600 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/proprietaire/logements')}
            disabled={enregistrement}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={enregistrement}>
            <Save className="h-4 w-4" />
            {enregistrement ? 'Enregistrement…' : "Enregistrer l'annonce"}
          </Button>
        </div>
      </form>
    </div>
  )
}
