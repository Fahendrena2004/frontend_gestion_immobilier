import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} B-TECH - Sehatra fanaovana location de logements ao Fianarantsoa.</p>
      </footer>
    </div>
  );
};
