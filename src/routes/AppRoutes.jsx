import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LogementsExplorerPage } from '../modules/logements/pages/LogementsExplorerPage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { ProfilePage } from '../modules/users/pages/ProfilePage';
import { AdminDashboardPage } from '../modules/administration/pages/AdminDashboardPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LogementsExplorerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Locataire Routes */}
        <Route element={<ProtectedRoute allowedRoles={['locataire', 'admin']} />}>
          <Route path="/demandes" element={<div className="p-4 bg-white rounded-lg border">Ny lisitry ny fangatahako trano</div>} />
          <Route path="/visites" element={<div className="p-4 bg-white rounded-lg border">Ny fandaharam-potoana fitsidihako</div>} />
          <Route path="/mes-locations" element={<div className="p-4 bg-white rounded-lg border">Ny trano efa hofako sy ny faktora</div>} />
        </Route>

        {/* Propriétaire Routes */}
        <Route element={<ProtectedRoute allowedRoles={['proprietaire', 'admin']} />}>
          <Route path="/mes-logements" element={<div className="p-4 bg-white rounded-lg border">Ny trano nampidiriko hofaina</div>} />
          <Route path="/mes-logements/new" element={<div className="p-4 bg-white rounded-lg border">Fampidirana trano vaovao</div>} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
