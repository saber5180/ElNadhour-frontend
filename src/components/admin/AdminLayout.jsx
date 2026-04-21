import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Utensils,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Image,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { name: 'Photos accueil', href: '/admin/medias-accueil', icon: Image },
    { name: 'Catégories', href: '/admin/categories', icon: FolderOpen },
    { name: 'Articles du menu', href: '/admin/articles', icon: Utensils },
  ];

  const isActive = (href) =>
    location.pathname === href ||
    (href !== '/admin' && location.pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 via-white to-cafe-100 text-cafe-900">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-cafe-900/30 backdrop-blur-sm lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen">
        {/* Sidebar : fixed tout le temps ; sur mobile elle se replie hors écran */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-cafe-200/90 bg-white/95 shadow-xl shadow-cafe-900/5 backdrop-blur-md transition-transform duration-300 ease-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-cafe-200/80 bg-cafe-50/50 px-5">
            <Link to="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow ring-1 ring-cafe-200/80">
                <img src="/icon.png" alt="" className="h-8 w-8" />
              </div>
              <div>
                <span className="block font-display text-sm font-semibold tracking-tight text-cafe-900">
                  El Nadhour
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-cafe-600">
                  Administration
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-cafe-600 hover:bg-cafe-100 hover:text-cafe-900 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-cafe-700 text-white shadow-md shadow-cafe-700/20'
                      : 'text-cafe-800 hover:bg-cafe-100/80 hover:text-cafe-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-cafe-100' : 'text-cafe-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-cafe-200/80 bg-cafe-50/40 p-4">
            <p className="truncate text-xs font-medium text-cafe-600">Connecté</p>
            <p className="truncate text-sm font-semibold text-cafe-900" title={user?.email}>
              {user?.email}
            </p>
            <div className="mt-3 space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-cafe-700 transition-colors hover:bg-white hover:text-cafe-900"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                Voir le site
              </a>
              <button
                type="button"
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {/* Décalage = largeur sidebar, sinon le contenu passe sous la barre fixe */}
        <div className="flex min-h-screen min-w-0 flex-col lg:ml-[17rem]">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-cafe-200/80 bg-white/85 px-4 shadow-sm backdrop-blur-md sm:h-16 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-cafe-700 hover:bg-cafe-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden flex-1 lg:block" />
            <p className="text-xs font-medium text-cafe-600 sm:text-sm">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
