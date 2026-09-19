import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BedDouble, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock,
  ImageOff, MapPin, Ruler, Send, Wallet,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Textarea from '@/components/ui/Textarea'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import StatusBadge from '@/components/shared/StatusBadge'
import Alert from '@/components/shared/Alert'
import LoadingState from '@/components/shared/LoadingState'
import EmptyState from '@/components/shared/EmptyState'
import useApiResource from '@/hooks/useApiResource'
import { propertyService } from '@/services/propertyService'
import { rentalService } from '@/services/rentalService'
import { useAuth } from '@/context/AuthContext'
import { formatMoney, formatRelativeDate } from '@/lib/utils'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()

  const { data: property, loading, error } = useApiResource(
    () => propertyService.getById(id),
    [id]
  )

  const [photoIndex, setPhotoIndex] = useState(0)

  // Demande de location
  const [demandeOuverte, setDemandeOuverte] = useState(false)
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false)
  const [demandeErreur, setDemandeErreur] = useState(null)

  // Demande de visite
  const [visiteEnCours, setVisiteEnCours] = useState(false)
  const [visiteDemandee, setVisiteDemandee] = useState(false)
  const [visiteErreur, setVisiteErreur] = useState(null)

  useEffect(() => {
    setPhotoIndex(0)
  }, [property?.id])

  // Un visiteur non connecté est renvoyé vers la connexion, puis ramené ici.
  function exigerConnexion() {
    navigate('/connexion', { state: { from: { pathname: `/logements/${id}` } } })
  }

  async function handleEnvoyerDemande() {
    setEnvoi(true)
    setDemandeErreur(null)
    try {
      await rentalService.createDemande({ logementId: property.id, message })
      setDemandeEnvoyee(true)
    } catch (err) {
      setDemandeErreur(err.message)
    } finally {
      setEnvoi(false)
    }
  }

  async function handleDemanderVisite() {
    if (!isAuthenticated) return exigerConnexion()

    setVisiteEnCours(true)
    setVisiteErreur(null)
    try {
      await rentalService.demanderVisite(property.id)
      setVisiteDemandee(true)
    } catch (err) {
      setVisiteErreur(err.message)
    } finally {
      setVisiteEnCours(false)
    }
  }

  if (loading) return <LoadingState className="py-24" label="Chargement du logement…" />

  if (error || !property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={ImageOff}
          title="Logement introuvable"
          description={error || "Cette annonce n'existe pas ou n'est plus publiée."}
          action={<Link to="/"><Button>Retour aux logements</Button></Link>}
        />
      </div>
    )
  }

  const photos = property.photos || []
  const equipements = property.equipementsDetail || []
  const estDisponible = property.statut === 'DISPONIBLE'
  // Un propriétaire ne peut ni postuler ni visiter : ces actions sont réservées
  // aux locataires (et aux visiteurs, invités à se connecter).
  const peutAgir = !isAuthenticated || role === 'LOCATAIRE'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={property.statut} />
        <span className="flex items-center gap-1 text-sm text-ink-500">
          <Clock className="h-3.5 w-3.5" />
          {formatRelativeDate(property.dateAjout)}
        </span>
      </div>

      <Gallery
        photos={photos}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
        fallbackLabel={property.type}
        titre={property.titre}
      />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{property.titre}</h1>
          <p className="mt-2 flex items-center gap-1 text-ink-500">
            <MapPin className="h-4 w-4" />
            {[property.adresse, property.quartier].filter(Boolean).join(', ')}, Fianarantsoa
          </p>

          <div className="mt-6 flex flex-wrap gap-6 border-y border-ink-100 py-4 text-sm text-ink-600">
            {property.pieces != null && (
              <span className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-brand-600" />
                {property.pieces} pièce{property.pieces > 1 ? 's' : ''}
              </span>
            )}
            {property.surface != null && (
              <span className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-brand-600" /> {property.surface} m²
              </span>
            )}
            {property.caution != null && (
              <span className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-brand-600" /> Caution {formatMoney(property.caution)}
              </span>
            )}
          </div>

          {property.description && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-semibold text-ink-900">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">
                {property.description}
              </p>
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold text-ink-900">Équipements</h2>
            {equipements.length === 0 ? (
              <p className="mt-2 text-sm text-ink-500">Aucun équipement renseigné pour ce logement.</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {equipements.map((eq) => (
                  <span key={eq.id} className="flex items-center gap-2 text-sm text-ink-600">
                    <Check className="h-4 w-4 text-emerald-500" /> {eq.nom}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="flex flex-col gap-4">
              <p className="font-display text-2xl font-bold text-brand-800">
                {formatMoney(property.prix)}{' '}
                <span className="text-sm font-normal text-ink-500">/mois</span>
              </p>

              <div className="flex items-center gap-3 border-t border-ink-100 pt-4">
                <Avatar name={property.proprietaireNom} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {property.proprietaireNom || 'Propriétaire'}
                  </p>
                  <p className="text-xs text-ink-500">Propriétaire</p>
                </div>
              </div>

              {!estDisponible && (
                <p className="rounded-md bg-ink-50 px-3 py-2 text-center text-sm text-ink-500">
                  Ce logement n'est pas disponible actuellement.
                </p>
              )}

              {estDisponible && peutAgir && (
                <div className="flex flex-col gap-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => (isAuthenticated ? setDemandeOuverte(true) : exigerConnexion())}
                  >
                    <Send className="h-4 w-4" /> Envoyer une demande
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={visiteEnCours || visiteDemandee}
                    onClick={handleDemanderVisite}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    {visiteDemandee ? 'Visite demandée' : visiteEnCours ? 'Envoi…' : 'Demander une visite'}
                  </Button>

                  {visiteDemandee && (
                    <Alert
                      variant="success"
                      message="Le propriétaire va vous proposer un créneau. Suivez-le dans « Mes visites »."
                    />
                  )}
                  {visiteErreur && <Alert message={visiteErreur} />}

                  {!isAuthenticated && (
                    <p className="text-center text-xs text-ink-500">
                      Connexion requise pour postuler ou visiter.
                    </p>
                  )}
                </div>
              )}

              {estDisponible && !peutAgir && (
                <p className="rounded-md bg-ink-50 px-3 py-2 text-center text-sm text-ink-500">
                  Les demandes de location sont réservées aux comptes locataires.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={demandeOuverte}
        onClose={() => {
          setDemandeOuverte(false)
          setDemandeEnvoyee(false)
          setDemandeErreur(null)
          setMessage('')
        }}
        title="Envoyer une demande de location"
        description={property.titre}
        footer={
          demandeEnvoyee ? (
            <Button onClick={() => setDemandeOuverte(false)}>Fermer</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setDemandeOuverte(false)}>Annuler</Button>
              <Button onClick={handleEnvoyerDemande} disabled={envoi || !message.trim()}>
                {envoi ? 'Envoi…' : 'Envoyer la demande'}
              </Button>
            </>
          )
        }
      >
        {demandeEnvoyee ? (
          <Alert
            variant="success"
            message="Votre demande a bien été transmise au propriétaire. Vous pouvez suivre son statut depuis « Mes demandes »."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {demandeErreur && <Alert message={demandeErreur} />}
            <Textarea
              label="Message au propriétaire"
              placeholder="Présentez-vous et précisez votre projet de location…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        )}
      </Dialog>
    </div>
  )
}

/** Galerie : photo principale + miniatures, avec repli si aucune photo. */
function Gallery({ photos, index, onIndexChange, fallbackLabel, titre }) {
  if (photos.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 sm:h-96">
        <ImageOff className="h-8 w-8 text-brand-100/60" />
        <span className="font-display text-lg font-medium text-brand-100/80">{fallbackLabel}</span>
        <span className="text-xs text-brand-100/60">Aucune photo pour ce logement</span>
      </div>
    )
  }

  const courante = photos[Math.min(index, photos.length - 1)]

  return (
    <div>
      <div className="relative h-72 overflow-hidden rounded-xl bg-ink-100 sm:h-96">
        <img src={courante.url} alt={titre} className="h-full w-full object-cover" />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink-700 shadow hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={() => onIndexChange((index + 1) % photos.length)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink-700 shadow hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink-950/60 px-2.5 py-1 text-xs font-medium text-white">
              {Math.min(index, photos.length - 1) + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-label={`Afficher la photo ${i + 1}`}
              aria-current={i === index}
              className={
                'h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors ' +
                (i === index ? 'border-brand-600' : 'border-transparent hover:border-ink-200')
              }
            >
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
