import React from 'react';
import { useAuth } from '../../../hooks/useAuth';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Momba ny Kaontiko</h2>
      <div className="space-y-2 text-sm">
        <p><span className="font-semibold text-slate-600">Anarana:</span> {user?.name}</p>
        <p><span className="font-semibold text-slate-600">Email:</span> {user?.email}</p>
        <p><span className="font-semibold text-slate-600">Finday:</span> {user?.telephone || 'Tsy misy'}</p>
        <p><span className="font-semibold text-slate-600">Andraikitra (Role):</span> <span className="capitalize font-medium text-blue-600">{user?.role}</span></p>
      </div>
    </div>
  );
};
