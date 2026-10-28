import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import LoadingState from '@/components/shared/LoadingState'
import PublicLayout from '@/components/layout/PublicLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

import HomePage from '@/pages/public/HomePage'

const PropertyDetailPage = lazy(() => import('@/pages/public/PropertyDetailPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

const LocataireDashboard = lazy(() => import('@/pages/locataire/LocataireDashboard'))
const MesDemandesPage = lazy(() => import('@/pages/locataire/MesDemandesPage'))
const MesVisitesPage = lazy(() => import('@/pages/locataire/MesVisitesPage'))
const MaLocationPage = lazy(() => import('@/pages/locataire/MaLocationPage'))

const ProprietaireDashboard = lazy(() => import('@/pages/proprietaire/ProprietaireDashboard'))
const MesLogementsPage = lazy(() => import('@/pages/proprietaire/MesLogementsPage'))
const LogementFormPage = lazy(() => import('@/pages/proprietaire/LogementFormPage'))
const DemandesRecuesPage = lazy(() => import('@/pages/proprietaire/DemandesRecuesPage'))
const VisitesPage = lazy(() => import('@/pages/proprietaire/VisitesPage'))

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const ModerationAnnoncesPage = lazy(() => import('@/pages/admin/ModerationAnnoncesPage'))
const ReferentielsPage = lazy(() => import('@/pages/admin/ReferentielsPage'))
const GestionComptesPage = lazy(() => import('@/pages/admin/GestionComptesPage'))
const PaiementsVerificationPage = lazy(() => import('@/pages/admin/PaiementsVerificationPage'))
const StatistiquesPage = lazy(() => import('@/pages/admin/StatistiquesPage'))

const ProfilPage = lazy(() => import('@/pages/shared/ProfilPage'))

export default function App() {
  return (
    <Suspense fallback={<LoadingState label="Chargement…" className="py-24" />}>
      <Routes>
      {/* Espace public — visiteur (US-V-*) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/logements/:id" element={<PropertyDetailPage />} />
      </Route>

      {/* Authentification */}
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />

      {/* Espace locataire (US-L-*) */}
      <Route
        path="/locataire"
        element={
          <ProtectedRoute roles={['LOCATAIRE']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LocataireDashboard />} />
        <Route path="demandes" element={<MesDemandesPage />} />
        <Route path="visites" element={<MesVisitesPage />} />
        <Route path="location" element={<MaLocationPage />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      {/* Espace propriétaire (US-P-*) */}
      <Route
        path="/proprietaire"
        element={
          <ProtectedRoute roles={['PROPRIETAIRE']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProprietaireDashboard />} />
        <Route path="logements" element={<MesLogementsPage />} />
        <Route path="logements/nouveau" element={<LogementFormPage />} />
        <Route path="logements/:id/modifier" element={<LogementFormPage />} />
        <Route path="demandes" element={<DemandesRecuesPage />} />
        <Route path="visites" element={<VisitesPage />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      {/* Espace administrateur (US-A-*) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMINISTRATEUR']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="moderation" element={<ModerationAnnoncesPage />} />
        <Route path="referentiels" element={<ReferentielsPage />} />
        <Route path="comptes" element={<GestionComptesPage />} />
        <Route path="paiements" element={<PaiementsVerificationPage />} />
        <Route path="statistiques" element={<StatistiquesPage />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-ink-50 text-center">
      <h1 className="font-display text-3xl font-bold text-ink-900">404</h1>
      <p className="text-sm text-ink-500">Cette page n'existe pas.</p>
      <a href="/" className="mt-2 text-sm font-medium text-brand-700 hover:underline">Retour à l'accueil</a>
    </div>
  )
}
