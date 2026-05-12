import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Menu, Phone, Radio, X } from 'lucide-react';
import api from '../services/api';

const NAV_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/carte', label: 'Notre carte' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  /** Indicateur LIVE temps réel (discret) — n'affiche le pill que si un live est actif */
  const { data: liveStatus } = useQuery(
    'navbar-live-status',
    () => api.get('/live/status').then((r) => r.data),
    { refetchInterval: 15000, staleTime: 5000, retry: 0 }
  );
  const isLive = Boolean(liveStatus?.isLive);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-300 supports-[backdrop-filter]:bg-white/85 ${
        scrolled
          ? 'border-cafe-200/70 bg-white/95 shadow-[0_10px_30px_-18px_rgba(15,37,41,0.25)]'
          : 'border-transparent bg-white/80'
      }`}
    >
      {/* Filet doré/menthe sous la nav quand au repos */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cafe-300/60 to-transparent"
        aria-hidden
      />

      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5 lg:px-8">
        {/* Logo + nom (nom toujours visible mobile — xs: n’existait pas dans Tailwind, d’où le bug) */}
        <Link
          to="/"
          className="group flex min-w-0 shrink items-center gap-2.5 text-cafe-900 transition-colors hover:text-cafe-700 sm:gap-3"
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-cafe-50 shadow-[0_6px_18px_-8px_rgba(15,37,41,0.35)] ring-1 ring-cafe-200/80 sm:h-12 sm:w-12">
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_25%,rgba(156,201,194,0.6),transparent_70%)] opacity-60"
              aria-hidden
            />
            <img
              src="/icon.png"
              alt="El Nadhour"
              className="relative h-9 w-9 shrink-0 object-contain transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-105 sm:h-10 sm:w-10"
            />
          </span>
          <span className="flex min-w-0 flex-col items-start text-left leading-tight">
            <span className="truncate font-display text-base font-semibold tracking-tight sm:text-xl">
              El Nadhour
            </span>
            <span className="hidden truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-cafe-600/80 sm:block">
              Restaurant & Café
            </span>
          </span>
        </Link>

        {/* Liens desktop */}
        <ul className="ml-4 hidden items-center gap-1 md:ml-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `nd-nav-link inline-block rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'is-active text-cafe-800'
                      : 'text-cafe-700/80 hover:text-cafe-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex-1" />

        {/* Actions à droite — « En direct » visible dès mobile dans la barre */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isLive && (
            <Link
              to="/en-direct"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-300/60 bg-red-50 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-red-700 shadow-sm shadow-red-200 transition-all hover:-translate-y-0.5 hover:bg-red-100 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-wider"
              aria-label="Voir le direct"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <Radio className="h-3 w-3 shrink-0 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">En direct</span>
              <span className="sm:hidden">Direct</span>
            </Link>
          )}

          <a
            href="tel:+33123456789"
            className="hidden items-center gap-1.5 rounded-full border border-cafe-700 bg-cafe-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cafe-800 hover:shadow-md sm:inline-flex md:text-sm"
          >
            <Phone className="h-3.5 w-3.5" />
            Réserver
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cafe-200 bg-white text-cafe-800 transition-colors hover:bg-cafe-50 md:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="border-t border-cafe-100 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-cafe-50 text-cafe-900'
                          : 'text-cafe-700/85 hover:bg-cafe-50/70'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {isLive && (
                <li>
                  <Link
                    to="/en-direct"
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-bold text-red-700"
                  >
                    <Radio className="h-4 w-4" /> En direct
                  </Link>
                </li>
              )}
              <li>
                <a
                  href="tel:+33123456789"
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-cafe-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-cafe-900/20"
                >
                  <Phone className="h-4 w-4" /> Réserver
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
