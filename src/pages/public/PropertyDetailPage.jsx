import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BedDouble, Check, MapPin, Ruler, Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Textarea from '@/components/ui/Textarea'
import Dialog, { DialogContent, DialogFooter } from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import StatusBadge from '@/components/shared/StatusBadge'
import { propertyService } from '@/services/propertyService'
import { rentalService } from '@/services/rentalService'
import { useAuth } from '@/context/AuthContext'
import { formatMoney } from '@/lib/utils'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const [property, setProperty] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    propertyService.getById(id).then(setProperty)
  }, [id])

  function handleDemanderClick() {
    if (!isAuthenticated) {
      navigate('/connexion', { state: { from: { pathname: `/logements/${id}` } } })
      return
    }
    setDialogOpen(true)
  }

  async function handleSendDemande() {
    setSending(true)
    await rentalService.createDemande({ logementId: id, logementTitre: property.titre, message })
    setSending(false)
    setSent(true)
  }

  if (!property) return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-ink-500">Chargement…</div>

  const equipementNoms = (property.equipementsDetail || []).map((eq) => eq.nom).filter(Boolean)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center gap-2">
        <StatusBadge status={property.statut} />
        <span className="text-sm text-ink-500">Publié le {new Date(property.dateAjout).toLocaleDateString('fr-FR')}</span>
      </div>

      <div className="flex h-72 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 sm:h-96">
        <span className="font-display text-lg font-medium text-brand-100/80">{property.type}</span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{property.titre}</h1>
          <p className="mt-2 flex items-center gap-1 text-ink-500">
            <MapPin className="h-4 w-4" /> {property.quartier}, Fianarantsoa
          </p>

          <div className="mt-6 flex gap-6 border-y border-ink-100 py-4 text-sm text-ink-600">
            <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-brand-600" /> {property.pieces} pièces</span>
            <span className="flex items-center gap-2"><Ruler className="h-4 w-4 text-brand-600" /> {property.surface} m²</span>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold text-ink-900">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{property.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold text-ink-900">Équipements</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {equipementNoms.map((nom) => (
                <span key={nom} className="flex items-center gap-2 text-sm text-ink-600">
                  <Check className="h-4 w-4 text-emerald-500" /> {nom}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="font-display text-2xl font-bold text-brand-800">
                  {formatMoney(property.prix)} <span className="text-sm font-normal text-ink-500">/mois</span>
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-ink-100 pt-4">
                <Avatar name={property.proprietaireNom} />
                <div>
                  <p className="text-sm font-medium text-ink-900">{property.proprietaireNom}</p>
                  <p className="text-xs text-ink-500">Propriétaire</p>
                </div>
              </div>

              {(!isAuthenticated || role === 'LOCATAIRE') && property.statut === 'DISPONIBLE' && (
                <Button onClick={handleDemanderClick} size="lg" className="w-full">
                  <Send className="h-4 w-4" /> Envoyer une demande
                </Button>
              )}
              {property.statut !== 'DISPONIBLE' && (
                <p className="rounded-md bg-ink-50 px-3 py-2 text-center text-sm text-ink-500">
                  Ce logement n'est pas disponible actuellement.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setSent(false); setMessage('') }}
      >
        <DialogContent>
          {sent ? (
            <p className="text-sm text-ink-600">
              Votre demande a bien été transmise au propriétaire. Vous pouvez suivre son statut depuis
              votre espace « Mes demandes ».
            </p>
          ) : (
            <Textarea
              label="Message au propriétaire"
              placeholder="Présentez-vous et précisez votre projet de location…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          )}
        </DialogContent>
        {!sent && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSendDemande} disabled={sending || !message.trim()}>
              {sending ? 'Envoi…' : 'Envoyer la demande'}
            </Button>
          </DialogFooter>
        )}
      </Dialog>
    </div>
  )
}
