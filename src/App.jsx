import { Routes, Route } from 'react-router-dom'

import PublicLayout from '@/components/layout/PublicLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

import HomePage from '@/pages/public/HomePage'
import PropertyDetailPage from '@/pages/public/PropertyDetailPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

import LocataireDashboard from '@/pages/locataire/LocataireDashboard'
import MesDemandesPage from '@/pages/locataire/MesDemandesPage'
import MesVisitesPage from '@/pages/locataire/MesVisitesPage'
import MaLocationPage from '@/pages/locataire/MaLocationPage'

import ProprietaireDashboard from '@/pages/proprietaire/ProprietaireDashboard'
import MesLogementsPage from '@/pages/proprietaire/MesLogementsPage'
import LogementFormPage from '@/pages/proprietaire/LogementFormPage'
import DemandesRecuesPage from '@/pages/proprietaire/DemandesRecuesPage'
import VisitesPage from '@/pages/proprietaire/VisitesPage'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import ModerationAnnoncesPage from '@/pages/admin/ModerationAnnoncesPage'
import GestionComptesPage from '@/pages/admin/GestionComptesPage'
import PaiementsVerificationPage from '@/pages/admin/PaiementsVerificationPage'
import StatistiquesPage from '@/pages/admin/StatistiquesPage'

import ProfilPage from '@/pages/shared/ProfilPage'

export default function App() {
  return (
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
        <Route path="comptes" element={<GestionComptesPage />} />
        <Route path="paiements" element={<PaiementsVerificationPage />} />
        <Route path="statistiques" element={<StatistiquesPage />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
