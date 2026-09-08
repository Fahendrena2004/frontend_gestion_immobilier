import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { propertyService } from '@/services/propertyService'
import { useAuth } from '@/context/AuthContext'
import { QUARTIERS } from '@/data/mockData'

const TYPES = ['Villa', 'Appartement', 'Studio', 'Maison', 'Duplex', 'Chambre']

const EMPTY_FORM = {
  titre: '', quartier: QUARTIERS[0], type: TYPES[0], prix: '', pieces: 1,
  surface: '', description: '', equipements: [],
}

export default function LogementFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [equipements, setEquipements] = useState([])
  const [saving, setSaving] = useState(false)

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

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, proprietaireId: user?.id, proprietaireNom: user?.nom }
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
      <p className="mt-1 text-sm text-ink-500">Renseignez les informations de votre annonce.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <Card>
          <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Titre de l'annonce"
                required
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="ex : Villa 3 chambres avec jardin"
              />
            </div>
            <Select label="Quartier" value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })}>
              {QUARTIERS.map((q) => <option key={q} value={q}>{q}</option>)}
            </Select>
            <Select label="Type de logement" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input
              label="Prix mensuel (Ar)"
              type="number"
              required
              value={form.prix}
              onChange={(e) => setForm({ ...form, prix: e.target.value })}
            />
            <Input
              label="Nombre de pièces"
              type="number"
              min={1}
              required
              value={form.pieces}
              onChange={(e) => setForm({ ...form, pieces: e.target.value })}
            />
            <Input
              label="Surface (m²)"
              type="number"
              value={form.surface}
              onChange={(e) => setForm({ ...form, surface: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez le logement, son environnement, ses atouts…"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Équipements</CardTitle></CardHeader>
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

        <Card>
          <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 py-10 text-center hover:border-brand-300">
              <ImagePlus className="h-6 w-6 text-ink-400" />
              <span className="text-sm font-medium text-ink-600">Cliquez pour ajouter des photos</span>
              <span className="text-xs text-ink-400">JPG, PNG — 5 Mo max par fichier</span>
              <input type="file" multiple accept="image/*" className="hidden" />
            </label>
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
