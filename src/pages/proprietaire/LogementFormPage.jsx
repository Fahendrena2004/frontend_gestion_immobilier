import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { propertyService } from '@/services/propertyService'
import { useAuth } from '@/context/AuthContext'
import { QUARTIERS } from '@/data/mockData'

const TYPES = ['Villa', 'Appartement', 'Studio', 'Maison', 'Duplex', 'Chambre']
const MAX_PHOTOS = 6

const EMPTY_FORM = {
  titre: '', quartier: QUARTIERS[0], type: TYPES[0], prix: '', pieces: 1,
  surface: '', description: '', equipements: [], photos: [],
}

export default function LogementFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [equipements, setEquipements] = useState([])
  const [saving, setSaving] = useState(false)
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [photoError, setPhotoError] = useState(null)

  useEffect(() => {
    propertyService.listEquipements().then(setEquipements)
    if (isEdit) {
      propertyService.getById(id).then((data) => data && setForm({ ...EMPTY_FORM, ...data }))
    }
  }, [id, isEdit])

  function toggleEquipement(eqId) {
    setForm((f) => ({
      ...f,
      equipements: f.equipements.includes(eqId) ? f.equipements.filter((e) => e !== eqId) : [...f.equipements, eqId],
    }))
  }

  function handlePhotosChange(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const currentCount = photoPreviews.length
    const remainingSlots = MAX_PHOTOS - currentCount

    if (files.length > remainingSlots) {
      setPhotoError(`Vous pouvez ajouter jusqu'à ${MAX_PHOTOS} photos maximum. Il vous reste ${remainingSlots} place${remainingSlots > 1 ? 's' : ''}.`)
      return
    }

    const newPreviews = files.slice(0, remainingSlots).map((file) => {
      if (!file.type.startsWith('image/')) return null
      return URL.createObjectURL(file)
    }).filter(Boolean)

    setPhotoPreviews((prev) => [...prev, ...newPreviews])
    setPhotoError(null)
  }

  function removePhoto(index) {
    setPhotoPreviews((prev) => {
      const url = prev[index]
      URL.revokeObjectURL(url)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, proprietaireId: user?.id, proprietaireNom: user?.nom, photos: photoPreviews }
    if (isEdit) await propertyService.update(id, payload)
    else await propertyService.create(payload)
    setSaving(false)
    navigate('/proprietaire/logements')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">
        {isEdit ? 'Modifier le logement' : 'Ajouter un logement'}
      </h1>
      <p className="mt-1 text-sm text-ink-500">Renseignez les informations de votre annonce. Les champs marqués d'un <span className="text-brick-500">*</span> sont obligatoires.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        {/* INFORMATIONS GÉNÉRALES */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription className="text-sm text-ink-500">
              Renseignez les caractéristiques principales du logement. Tous les champs marqués <span className="text-brick-500">*</span> sont obligatoires.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Titre de l'annonce <span className='text-brick-500'>*</span>"
                required
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="ex : Villa 3 chambres avec jardin"
              />
            </div>
            <Select
              label={
                <>
                  Quartier <span className="text-brick-500">*</span>
                </>
              }
              value={form.quartier}
              onChange={(e) => setForm({ ...form, quartier: e.target.value })}
            >
              {QUARTIERS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </Select>
            <Select
              label="Type de logement <span className='text-brick-500'>*</span>"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input
              label="Prix mensuel (Ar) <span className='text-brick-500'>*</span>"
              type="number"
              required
              value={form.prix}
              onChange={(e) => setForm({ ...form, prix: e.target.value })}
              placeholder="ex : 700000"
            />
            <Input
              label="Nombre de pièces <span className='text-brick-500'>*</span>"
              type="number"
              min={1}
              required
              value={form.pieces}
              onChange={(e) => setForm({ ...form, pieces: e.target.value })}
              placeholder="ex : 3"
            />
            <Input
              label="Surface (m²) <span className='text-brick-500'>*</span>"
              type="number"
              required
              value={form.surface}
              onChange={(e) => setForm({ ...form, surface: e.target.value })}
              placeholder="ex : 80"
            />
            <div className="sm:col-span-2">
              <Input
                label="Adresse <span className='text-brick-500'>*</span>"
                required
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                placeholder="ex : Rue de l'Indépendance, près du marché"
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Description <span className='text-brick-500'>*</span>"
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="ex : Belle villa familiale au calme, à deux pas du centre-ville, avec jardin clos et parking privé."
              />
              <p className="mt-1 text-xs text-ink-500">Décrivez le logement, son environnement, son accès aux transports, ses atouts.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Caution (Ar)
              </label>
              <Input
                type="number"
                value={form.caution}
                onChange={(e) => setForm({ ...form, caution: e.target.value })}
                placeholder="ex : 700000"
              />
            </div>
          </CardContent>
        </Card>

        {/* ÉQUIPEMENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Équipements</CardTitle>
            <CardDescription className="text-sm text-ink-500">
              Sélectionnez les équipements disponibles dans le logement. Cochez toutes les cases qui s'appliquent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {equipements.map((eq) => (
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

        {/* PHOTOS */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription className="text-sm text-ink-500">
              Ajoutez jusqu'à {MAX_PHOTOS} photos (JPG ou PNG, 5 Mo max chacune). La première sera votre photo principale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {photoError && (
              <div className="mb-4 p-3 rounded-lg bg-brick-50 border border-brick-200 flex items-start gap-2 text-sm text-brick-600" role="alert">
                <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{photoError}</span>
              </div>
            )}
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 py-10 text-center hover:border-brand-300 transition-colors"
              style={{ opacity: photoPreviews.length >= MAX_PHOTOS ? 0.5 : 1 }}
            >
              <ImagePlus className="h-6 w-6 text-ink-400" />
              <span className="text-sm font-medium text-ink-600">
                {photoPreviews.length === 0 ? 'Cliquez pour ajouter des photos' : `${photoPreviews.length} / ${MAX_PHOTOS} photos ajoutées`}
              </span>
              <span className="text-xs text-ink-400">JPG, PNG — 5 Mo max par fichier</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePhotosChange}
                disabled={photoPreviews.length >= MAX_PHOTOS}
              />
            </label>

            {photoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-ink-200">
                    <img src={preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brick-600"
                      aria-label="Supprimer cette photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded">Principale</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/proprietaire/logements')}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : "Enregistrer l'annonce"}
          </Button>
        </div>
      </form>
    </div>
  )
}