import { useEffect, useState } from 'react'
import { Check, GitMerge, ListChecks, AlertTriangle, Building2, MapPin } from 'lucide-react'
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Alert from '@/components/shared/Alert'
import EmptyState from '@/components/shared/EmptyState'
import LoadingState from '@/components/shared/LoadingState'
import { adminService } from '@/services/adminService'

export default function ReferentielsPage() {
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [actionErreur, setActionErreur] = useState(null)
  const [actionSucces, setActionSucces] = useState(null)
  const [actionEnCours, setActionEnCours] = useState(null)

  const [enAttente, setEnAttente] = useState({ quartiers: [], types: [] })
  const [ciblesQuartiers, setCiblesQuartiers] = useState([])
  const [ciblesTypes, setCiblesTypes] = useState([])

  const [ciblesSelectionnees, setCiblesSelectionnees] = useState({})
  const [confirmationFusion, setConfirmationFusion] = useState(null)

  async function chargerDonnees() {
    setChargement(true)
    setErreur(null)
    try {
      const [dataEnAttente, quartiersValides, typesValides] = await Promise.all([
        adminService.listReferentielsEnAttente(),
        adminService.listCiblesValides('quartiers'),
        adminService.listCiblesValides('types'),
      ])
      setEnAttente(dataEnAttente)
      setCiblesQuartiers(quartiersValides)
      setCiblesTypes(typesValides)
    } catch (err) {
      setErreur(err.message || 'Impossible de charger les référentiels.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerDonnees()
  }, [])

  function setCible(ressource, id, cibleId) {
    setCiblesSelectionnees((prev) => ({
      ...prev,
      [`${ressource}_${id}`]: cibleId,
    }))
  }

  async function handleValider(ressource, item) {
    setActionEnCours(`valider_${ressource}_${item.id}`)
    setActionErreur(null)
    setActionSucces(null)
    try {
      await adminService.validerReferentiel(ressource, item.id)
      setActionSucces(`« ${item.libelle} » a été validé avec succès.`)
      await chargerDonnees()
    } catch (err) {
      setActionErreur(err.message || 'Erreur lors de la validation.')
    } finally {
      setActionEnCours(null)
    }
  }

  function ouvrirConfirmationFusion(ressource, source) {
    const cibleId = ciblesSelectionnees[`${ressource}_${source.id}`]
    if (!cibleId) return

    const listeCibles = ressource === 'quartiers' ? ciblesQuartiers : ciblesTypes
    const cible = listeCibles.find((c) => String(c.id) === String(cibleId))
    if (!cible) return

    setActionErreur(null)
    setConfirmationFusion({
      ressource,
      source,
      cible,
      cibleId,
    })
  }

  async function executerFusion() {
    if (!confirmationFusion) return
    const { ressource, source, cibleId, cible } = confirmationFusion

    setActionEnCours(`fusionner_${ressource}_${source.id}`)
    setActionErreur(null)
    setActionSucces(null)
    try {
      const res = await adminService.fusionnerReferentiel(ressource, source.id, cibleId)
      const count = res?.logements_reaffectes ?? source.logements_count
      setActionSucces(
        `« ${source.libelle} » a été fusionné avec succès vers « ${cible.nom || cible.libelle} » (${count} logement(s) réaffecté(s)).`
      )
      setConfirmationFusion(null)
      await chargerDonnees()
    } catch (err) {
      setActionErreur(err.message || 'Erreur lors de la fusion.')
    } finally {
      setActionEnCours(null)
    }
  }

  return (
    <div className="space-y-6 [&_button:focus]:ring-gold-300/70">
      {/* En-tête */}
      <header className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-900/20">
              <ListChecks className="h-5 w-5 text-gold-300" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                Administration
              </p>
              <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-brand-800">
                Quartiers et types en attente
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Validez les nouvelles propositions ou fusionnez-les avec des valeurs existantes pour corriger les fautes de frappe.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages et alertes */}
      {erreur && (
        <Alert title="Impossible de charger les données" message={erreur}>
          <Button variant="outline" size="sm" className="mt-2 rounded-lg" onClick={chargerDonnees}>
            Réessayer
          </Button>
        </Alert>
      )}

      {actionErreur && <Alert title="Erreur" message={actionErreur} />}
      {actionSucces && <Alert variant="success" message={actionSucces} />}

      {chargement && (
        <LoadingState
          label="Chargement des valeurs en attente…"
          className="rounded-xl border border-ink-100 bg-white py-12"
        />
      )}

      {!chargement && !erreur && (
        <div className="space-y-8">
          {/* Section Quartiers */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                <MapPin className="h-5 w-5 text-brand-600" />
                Quartiers
                <span className="ml-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                  {enAttente.quartiers.length}
                </span>
              </h2>
            </div>

            {enAttente.quartiers.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Aucune valeur en attente"
                description="Tous les quartiers saisis sont validés."
                className="rounded-xl bg-white py-8"
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
                <Table>
                  <Thead className="border-b-2 border-gold-500/40 bg-white text-[11px] tracking-wider text-brand-800/90">
                    <tr>
                      <Th className="px-5 py-3.5">Quartier proposé</Th>
                      <Th className="px-5 py-3.5">Logements rattachés</Th>
                      <Th className="px-5 py-3.5 text-right">Actions</Th>
                    </tr>
                  </Thead>
                  <tbody>
                    {enAttente.quartiers.map((q) => {
                      const enCoursValidation = actionEnCours === `valider_quartiers_${q.id}`
                      const enCoursFusion = actionEnCours === `fusionner_quartiers_${q.id}`
                      const cibleSelect = ciblesSelectionnees[`quartiers_${q.id}`] || ''

                      return (
                        <Tr key={q.id} className="transition-colors duration-150 hover:bg-brand-50/50">
                          <Td className="px-5 py-4">
                            <p className="font-medium text-ink-900">{q.libelle}</p>
                            <span className="text-xs text-ink-400">Ville : {q.ville || 'Fianarantsoa'}</span>
                          </Td>
                          <Td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                              {q.logements_count} logement{q.logements_count > 1 ? 's' : ''}
                            </span>
                          </Td>
                          <Td className="px-5 py-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={!!actionEnCours}
                                onClick={() => handleValider('quartiers', q)}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                {enCoursValidation ? 'Validation…' : 'Valider'}
                              </Button>

                              <div className="flex items-center gap-1.5">
                                <select
                                  value={cibleSelect}
                                  onChange={(e) => setCible('quartiers', q.id, e.target.value)}
                                  disabled={!!actionEnCours}
                                  className="h-9 max-w-[200px] rounded-md border border-ink-200 bg-white px-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                >
                                  <option value="">Fusionner avec…</option>
                                  {ciblesQuartiers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.nom}
                                    </option>
                                  ))}
                                </select>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!cibleSelect || !!actionEnCours}
                                  onClick={() => ouvrirConfirmationFusion('quartiers', q)}
                                  className="border-ink-200 text-ink-700 hover:bg-ink-50"
                                >
                                  <GitMerge className="mr-1 h-4 w-4" />
                                  {enCoursFusion ? 'Fusion…' : 'Fusionner'}
                                </Button>
                              </div>
                            </div>
                          </Td>
                        </Tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </section>

          {/* Section Types de logement */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                <Building2 className="h-5 w-5 text-brand-600" />
                Types de logement
                <span className="ml-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                  {enAttente.types.length}
                </span>
              </h2>
            </div>

            {enAttente.types.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Aucune valeur en attente"
                description="Tous les types de logement saisis sont validés."
                className="rounded-xl bg-white py-8"
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
                <Table>
                  <Thead className="border-b-2 border-gold-500/40 bg-white text-[11px] tracking-wider text-brand-800/90">
                    <tr>
                      <Th className="px-5 py-3.5">Type proposé</Th>
                      <Th className="px-5 py-3.5">Logements rattachés</Th>
                      <Th className="px-5 py-3.5 text-right">Actions</Th>
                    </tr>
                  </Thead>
                  <tbody>
                    {enAttente.types.map((t) => {
                      const enCoursValidation = actionEnCours === `valider_types_${t.id}`
                      const enCoursFusion = actionEnCours === `fusionner_types_${t.id}`
                      const cibleSelect = ciblesSelectionnees[`types_${t.id}`] || ''

                      return (
                        <Tr key={t.id} className="transition-colors duration-150 hover:bg-brand-50/50">
                          <Td className="px-5 py-4">
                            <p className="font-medium text-ink-900">{t.libelle}</p>
                          </Td>
                          <Td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                              {t.logements_count} logement{t.logements_count > 1 ? 's' : ''}
                            </span>
                          </Td>
                          <Td className="px-5 py-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={!!actionEnCours}
                                onClick={() => handleValider('types', t)}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                {enCoursValidation ? 'Validation…' : 'Valider'}
                              </Button>

                              <div className="flex items-center gap-1.5">
                                <select
                                  value={cibleSelect}
                                  onChange={(e) => setCible('types', t.id, e.target.value)}
                                  disabled={!!actionEnCours}
                                  className="h-9 max-w-[200px] rounded-md border border-ink-200 bg-white px-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                >
                                  <option value="">Fusionner avec…</option>
                                  {ciblesTypes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.libelle}
                                    </option>
                                  ))}
                                </select>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!cibleSelect || !!actionEnCours}
                                  onClick={() => ouvrirConfirmationFusion('types', t)}
                                  className="border-ink-200 text-ink-700 hover:bg-ink-50"
                                >
                                  <GitMerge className="mr-1 h-4 w-4" />
                                  {enCoursFusion ? 'Fusion…' : 'Fusionner'}
                                </Button>
                              </div>
                            </div>
                          </Td>
                        </Tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modale de confirmation de fusion */}
      <Dialog
        open={!!confirmationFusion}
        onClose={() => !actionEnCours && setConfirmationFusion(null)}
        title="Confirmer la fusion"
        description={
          confirmationFusion
            ? `Fusion de « ${confirmationFusion.source.libelle} » vers « ${confirmationFusion.cible.nom || confirmationFusion.cible.libelle} »`
            : ''
        }
        className="rounded-xl border border-ink-100 shadow-2xl"
        footer={
          <>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setConfirmationFusion(null)}
              disabled={!!actionEnCours}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="rounded-lg shadow-sm"
              onClick={executerFusion}
              disabled={!!actionEnCours}
            >
              {actionEnCours ? 'Fusion en cours…' : 'Confirmer la fusion'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-gold-100 bg-gold-50/60 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
            <div className="text-sm text-ink-700">
              <p className="font-semibold text-ink-900 mb-1">Attention, cette suppression est définitive !</p>
              <p>
                Les <strong>{confirmationFusion?.source.logements_count || 0} logement(s)</strong> actuellement rattachés à «{' '}
                {confirmationFusion?.source.libelle} » seront réaffectés à «{' '}
                {confirmationFusion?.cible.nom || confirmationFusion?.cible.libelle} », puis la proposition «{' '}
                {confirmationFusion?.source.libelle} » sera définitivement supprimée.
              </p>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
