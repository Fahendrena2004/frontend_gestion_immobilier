import React from 'react';

export const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord - Administrateur B-TECH</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Trano Voasoratra</p>
          <h3 className="text-2xl font-bold mt-1">0</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Mpanofa (Locataires)</p>
          <h3 className="text-2xl font-bold mt-1">0</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Tompon-trano</p>
          <h3 className="text-2xl font-bold mt-1">0</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Fifanarahana Mavitrika</p>
          <h3 className="text-2xl font-bold mt-1">0</h3>
        </div>
      </div>
    </div>
  );
};
