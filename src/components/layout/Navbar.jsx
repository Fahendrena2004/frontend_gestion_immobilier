import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Building2, User, LogOut, LogIn, LayoutDashboard, PlusCircle } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span>B-TECH <span className="text-xs font-normal text-muted-foreground">Fianarantsoa</span></span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Trano Hofaina
          </Link>

          {isAuthenticated && (
            <>
              {hasRole('locataire') && (
                <>
                  <Link to="/demandes" className="hover:text-blue-600 transition-colors">
                    Fangatahako
                  </Link>
                  <Link to="/visites" className="hover:text-blue-600 transition-colors">
                    Fitsidihana
                  </Link>
                  <Link to="/mes-locations" className="hover:text-blue-600 transition-colors">
                    Trano Hofaiko
                  </Link>
                </>
              )}

              {hasRole('proprietaire') && (
                <>
                  <Link to="/mes-logements" className="hover:text-blue-600 transition-colors">
                    Tranoko
                  </Link>
                  <Link to="/mes-logements/new" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <PlusCircle className="h-4 w-4" /> Ampidiro Trano
                  </Link>
                </>
              )}

              {hasRole('admin') && (
                <Link to="/admin" className="flex items-center gap-1 text-purple-600 font-semibold">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard Admin
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 text-sm hover:text-blue-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                  {user?.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" /> Hivoaka
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md hover:bg-muted"
              >
                <LogIn className="h-4 w-4" /> Hiditra
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Hisoratra anarana
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
