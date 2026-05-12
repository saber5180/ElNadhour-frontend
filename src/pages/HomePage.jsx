import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ArrowRight,
  Star,
  Coffee,
  Utensils,
  Clock,
  Phone,
  MapPin,
  Award,
  Sparkles,
  Wifi,
  Leaf,
  CalendarDays,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import HeroBackground from '../components/HeroBackground';
import { mediaUrl } from '../utils/mediaUrl';

const HIGHLIGHTS = [
  { icon: Coffee, title: 'Café artisanal', subtitle: 'Grains sélectionnés' },
  { icon: Leaf, title: 'Cuisine fraîche', subtitle: 'Produits du jour' },
  { icon: Wifi, title: 'Wi-Fi gratuit', subtitle: 'Connexion rapide' },
  { icon: CalendarDays, title: 'Sur réservation', subtitle: 'Tables privées' },
];

const HomePage = () => {
  const { data: heroPhotos } = useQuery(
    'hero-images',
    () => api.get('/hero-images').then((res) => res.data),
    { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false }
  );
  const hasHeroPhotos = Boolean((heroPhotos ?? []).length);

  const { data: categories, isLoading } = useQuery(
    'categories',
    () => api.get('/categories').then((res) => res.data),
    { staleTime: 5 * 60 * 1000 }
  );

  return (
    <div>
      {/* Splash Screen initial (disparaît après 1.5s) */}
      <div className="nd-splash pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-cafe-900">
        <div className="nd-splash-logo flex flex-col items-center gap-4">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_0_80px_rgba(156,201,194,0.3)]">
            <img src="/icon.png" alt="" className="h-16 w-16 object-contain" />
          </div>
          <div className="h-0.5 w-12 overflow-hidden rounded-full bg-cafe-800">
            <div className="nd-splash-progress h-full bg-cafe-300" />
          </div>
        </div>
      </div>

      {/* ============================================================
          HERO — cinématique, halos lumineux, entrée échelonnée
          ============================================================ */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-gradient-to-br from-cafe-50 to-cafe-100 md:min-h-screen">
        <HeroBackground />

        {hasHeroPhotos && (
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-cafe-900/72 via-cafe-800/45 to-cafe-900/65"
            aria-hidden
          />
        )}

        {/* Halos lumineux animés — profondeur premium */}
        <span className="nd-orb nd-orb--a z-[2]" aria-hidden />
        <span className="nd-orb nd-orb--b z-[2]" aria-hidden />
        <span className="nd-orb nd-orb--c z-[2]" aria-hidden />

        {/* Grain subtil */}
        <span className="nd-grain z-[3]" aria-hidden />

        {/* Voile bas — fond doux qui se fond avec la section suivante */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-28 bg-gradient-to-b from-transparent to-white"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-8 md:mb-12">
            {/* Logo + accroche : colonne explicite (desktop) pour rester l’un sous l’autre */}
            <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
              <div className="nd-hero-rise nd-delay-1 relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_28px_60px_-20px_rgba(15,37,41,0.55)] ring-1 ring-cafe-200/80 sm:h-44 sm:w-44">
                <span
                  className="pointer-events-none absolute inset-[-18%] -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(156,201,194,0.6),transparent_60%)] blur-2xl"
                  aria-hidden
                />
                <img
                  src="/icon.png"
                  alt="El Nadhour"
                  className="h-[6.5rem] w-[6.5rem] object-contain sm:h-28 sm:w-28"
                />
              </div>

              <div
                className={`nd-hero-rise nd-delay-2 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full px-4 py-2 text-center text-[13px] font-semibold leading-snug backdrop-blur-md sm:px-4 sm:py-2 sm:text-[12px] sm:uppercase sm:tracking-[0.15em] md:text-[13px] ${
                  hasHeroPhotos
                    ? 'border border-white/35 bg-white/15 text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]'
                    : 'border border-cafe-200/80 bg-white/70 text-cafe-700'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Restaurant & Café · depuis 2025</span>
              </div>
            </div>

            <h1
              className={`nd-hero-rise nd-delay-3 mt-8 font-display text-5xl font-bold tracking-tight md:mt-10 md:text-[5.5rem] md:leading-[1.05] ${
                hasHeroPhotos ? 'text-white drop-shadow-[0_2px_18px_rgba(15,37,41,0.55)]' : 'text-cafe-900'
              }`}
            >
              El&nbsp;Nadhour
              <span
                className="ml-2 inline-block h-3 w-3 translate-y-[-0.35em] rounded-full bg-cafe-300 shadow-[0_0_20px_rgba(156,201,194,0.95)] md:h-4 md:w-4"
                aria-hidden
              />
            </h1>
          </div>

          <div className="nd-hero-rise nd-delay-4 space-y-6">
            <Link
              to="/carte"
              className="nd-glow-hover inline-flex transform items-center rounded-2xl bg-cafe-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-cafe-800 hover:shadow-xl md:px-14 md:py-6 md:text-xl"
            >
              Découvrir Notre Menu
              <ArrowRight className="ml-2 h-5 w-5 md:ml-3 md:h-6 md:w-6" />
            </Link>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="#contact-section"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/95 px-6 py-3 font-semibold text-cafe-800 shadow-md ring-1 ring-cafe-100 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg md:px-8 md:py-4"
              >
                <Phone className="h-5 w-5" />
                Nous contacter
              </a>
              <a
                href="https://maps.app.goo.gl/b5PdvFyRr2yQjXXD9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/95 px-6 py-3 font-semibold text-cafe-800 shadow-md ring-1 ring-cafe-100 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg md:px-8 md:py-4"
              >
                <MapPin className="h-5 w-5" />
                Nous Trouver
              </a>
            </div>
          </div>
        </div>

        {/* Indicateur scroll discret */}
        <div
          className="nd-hero-rise nd-delay-5 pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] md:flex"
        >
          <span className={hasHeroPhotos ? 'text-white/70' : 'text-cafe-700/60'}>Défiler</span>
          <span
            className={`flex h-6 w-3.5 items-start justify-center rounded-full border ${
              hasHeroPhotos ? 'border-white/60' : 'border-cafe-700/40'
            }`}
          >
            <span
              className={`mt-1 h-1.5 w-0.5 animate-bounce rounded-full ${
                hasHeroPhotos ? 'bg-white/80' : 'bg-cafe-700/60'
              }`}
            />
          </span>
        </div>
      </section>

      {/* ============================================================
          MARQUEE INFINI — Ticker text
          ============================================================ */}
      <div className="relative flex overflow-hidden border-b border-cafe-200/50 bg-cafe-900 py-3 text-white sm:py-4">
        <div className="animate-hero-marquee flex whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] sm:text-base">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-4 flex items-center gap-8">
              <span>Café de spécialité</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cafe-400" />
              <span>Pâtisseries Maison</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cafe-400" />
              <span>Brunch &amp; Lunch</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cafe-400" />
              <span>Ambiance Lounge</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cafe-400" />
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================
          BANDEAU « Pourquoi nous choisir » — garanties premium
          ============================================================ */}
      <section className="relative border-b border-cafe-100/80 bg-white">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cafe-300/60 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon;
              return (
                <li
                  key={h.title}
                  className={`nd-reveal nd-reveal-d${(i % 4) + 1} group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-cafe-100 bg-white px-5 py-4 shadow-[0_8px_24px_-18px_rgba(15,37,41,0.35)] ring-1 ring-cafe-50 transition-all duration-300 hover:-translate-y-1 hover:border-cafe-200 hover:shadow-[0_20px_40px_-20px_rgba(15,37,41,0.4)] md:px-6 md:py-5`}
                >
                  <span
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-cafe-100/70 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-cafe-50 to-white text-cafe-700 ring-1 ring-cafe-100 transition-transform duration-300 group-hover:scale-105 md:h-14 md:w-14">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-cafe-900 md:text-[17px]">{h.title}</p>
                    <p className="truncate text-xs font-medium text-cafe-600/80 md:text-[13px]">{h.subtitle}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ============================================================
          NOS SPÉCIALITÉS — cartes catégories, shine + reveal
          ============================================================ */}
      <section className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="nd-reveal mb-16 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cafe-200/80 bg-cafe-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cafe-700">
              <Sparkles className="h-3 w-3" />
              À la carte
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold text-cafe-900 md:text-5xl">
              Nos{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-cafe-700 via-cafe-600 to-cafe-500 bg-clip-text text-transparent">
                  Spécialités
                </span>
                <span
                  className="absolute -bottom-1 left-0 h-3 w-full skew-x-[-8deg] rounded-sm bg-cafe-200/50 blur-[2px]"
                  aria-hidden
                />
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-cafe-600">
              Une sélection pensée par nos chefs — fraîche, généreuse, et toujours préparée le jour même.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner text="Chargement des spécialités..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {categories?.map((category, i) => (
                <Link
                  key={category.id}
                  to={`/carte?cat=${category.id}`}
                  className={`nd-reveal nd-reveal-d${(i % 4) + 1} nd-card-lift group relative overflow-hidden rounded-[2rem] border border-cafe-200/80 bg-white shadow-[0_12px_30px_-15px_rgba(15,37,41,0.2)] transition-colors duration-300 hover:border-cafe-300 hover:shadow-[0_20px_40px_-15px_rgba(15,37,41,0.3)]`}
                >
                  <div className="relative h-64 overflow-hidden bg-cafe-100">
                    <img
                      src={mediaUrl(category.image_url) || '/placeholder-category.svg'}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-[650ms] ease-out group-hover:scale-[1.07]"
                      onError={(e) => {
                        e.target.src = '/placeholder-category.svg';
                      }}
                    />
                    {/* Voile dégradé */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cafe-900/70 via-cafe-900/15 to-transparent" />
                    {/* Halo lumineux au survol */}
                    <div
                      className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-cafe-500/0 via-cafe-400/0 to-cafe-300/0 opacity-0 transition-opacity duration-500 group-hover:from-cafe-500/30 group-hover:via-cafe-400/20 group-hover:to-cafe-300/25 group-hover:opacity-100"
                      aria-hidden
                    />
                    {/* Shine sweep premium */}
                    <span className="nd-shine" aria-hidden />
                    {/* Badge corner */}
                    <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cafe-800 backdrop-blur-sm shadow-sm">
                      <Sparkles className="h-3 w-3" /> Spécialité
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-6 py-5">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-2xl font-bold text-cafe-900 md:text-3xl">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-cafe-600">Voir les articles de cette catégorie</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cafe-200 bg-cafe-50 text-cafe-700 transition-all duration-300 group-hover:translate-x-1 group-hover:border-cafe-300 group-hover:bg-cafe-100 group-hover:text-cafe-900">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="nd-reveal nd-reveal-d2 mt-16 text-center">
            <Link
              to="/carte"
              className="nd-glow-hover inline-flex items-center rounded-2xl bg-cafe-700 px-12 py-5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-cafe-800 hover:shadow-xl md:text-xl"
            >
              Voir Notre Menu
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          INFO — Horaires / Adresse / Engagement
          ============================================================ */}
      <section id="contact-section" className="relative overflow-hidden bg-cafe-50 py-24">
        {/* Halos discrets dans le fond */}
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-cafe-200/40 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cafe-300/30 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="nd-reveal mb-16 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cafe-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cafe-700">
              <MapPin className="h-3 w-3" />
              L'Expérience El Nadhour
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold text-cafe-900 md:text-5xl">
              Plus qu'un café, un lieu de vie
            </h2>
          </div>

          {/* BENTO GRID LAYOUT */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-2 md:gap-6">
            
            {/* Bento 1 : Horaires (Large) */}
            <div className="nd-reveal nd-reveal-d1 nd-card-lift group relative overflow-hidden rounded-3xl border border-white bg-white p-8 shadow-[0_20px_50px_-30px_rgba(15,37,41,0.45)] md:col-span-8 md:row-span-1 md:p-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cafe-50 transition-transform duration-500 group-hover:scale-150" aria-hidden />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8 md:flex-row md:items-center">
                <div>
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cafe-900 text-white shadow-lg">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-3xl font-bold text-cafe-900">Ouvert tous les jours</h3>
                  <p className="mt-2 max-w-sm text-cafe-600">Du petit matin pour votre premier café jusqu'au soir pour un moment détente.</p>
                </div>
                <ul className="w-full shrink-0 space-y-3 rounded-2xl bg-cafe-50/50 p-6 ring-1 ring-cafe-100 md:w-72">
                  <li className="flex items-baseline justify-between border-b border-cafe-200/60 pb-2">
                    <span className="font-medium text-cafe-700">Lun – Ven</span>
                    <span className="font-bold tabular-nums text-cafe-900">7h – 19h</span>
                  </li>
                  <li className="flex items-baseline justify-between border-b border-cafe-200/60 pb-2">
                    <span className="font-medium text-cafe-700">Sam – Dim</span>
                    <span className="font-bold tabular-nums text-cafe-900">8h – 20h</span>
                  </li>
                  <li className="flex items-baseline justify-between">
                    <span className="font-medium text-cafe-700">Jours fériés</span>
                    <span className="font-bold tabular-nums text-cafe-900">9h – 18h</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bento 2 : Adresse (Tall) */}
            <div className="nd-reveal nd-reveal-d2 nd-card-lift group relative overflow-hidden rounded-3xl border border-white bg-cafe-900 p-8 text-white shadow-[0_20px_50px_-30px_rgba(15,37,41,0.45)] md:col-span-4 md:row-span-2 md:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(156,201,194,0.15),transparent_50%)]" aria-hidden />
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-display text-3xl font-bold">Nous trouver</h3>
                <div className="mt-6 space-y-2 text-lg text-white/80">
                  <p>123 Rue de la Paix</p>
                  <p>75001 Paris</p>
                </div>
                <div className="mt-8">
                  <p className="text-sm font-medium uppercase tracking-wider text-cafe-300">Téléphone</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">+33 1 23 45 67 89</p>
                </div>
                <div className="mt-auto pt-10">
                  <a
                    href="https://maps.app.goo.gl/b5PdvFyRr2yQjXXD9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-cafe-900 transition-transform hover:scale-[1.02]"
                  >
                    Itinéraire Maps <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bento 3 : Engagement (Wide) */}
            <div className="nd-reveal nd-reveal-d3 nd-card-lift group relative overflow-hidden rounded-3xl border border-white bg-white p-8 shadow-[0_20px_50px_-30px_rgba(15,37,41,0.45)] md:col-span-8 md:row-span-1 md:p-10">
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-cafe-100 to-transparent opacity-50 transition-transform duration-700 group-hover:scale-110" aria-hidden />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-sm">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cafe-50 text-cafe-700 ring-1 ring-cafe-200">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-3xl font-bold text-cafe-900">Notre engagement</h3>
                  <p className="mt-2 text-cafe-600">La qualité sans compromis, du grain de café à l'assiette.</p>
                </div>
                <div className="grid w-full grid-cols-2 gap-4 md:w-auto">
                  <div className="flex items-center gap-3 rounded-2xl bg-cafe-50/50 p-4 ring-1 ring-cafe-100">
                    <Coffee className="h-5 w-5 text-cafe-700" />
                    <span className="text-sm font-semibold text-cafe-900">Artisanal</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-cafe-50/50 p-4 ring-1 ring-cafe-100">
                    <Utensils className="h-5 w-5 text-cafe-700" />
                    <span className="text-sm font-semibold text-cafe-900">Fait maison</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-cafe-50/50 p-4 ring-1 ring-cafe-100">
                    <Star className="h-5 w-5 text-cafe-700" />
                    <span className="text-sm font-semibold text-cafe-900">Premium</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-cafe-50/50 p-4 ring-1 ring-cafe-100">
                    <Leaf className="h-5 w-5 text-cafe-700" />
                    <span className="text-sm font-semibold text-cafe-900">Frais du jour</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          CTA final — Réservation
          ============================================================ */}
      <section className="relative overflow-hidden bg-cafe-900 py-24 text-white">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-cafe-700/40 blur-[100px]" aria-hidden />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-cafe-500/30 blur-[100px]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h3 className="nd-reveal font-display text-4xl font-bold tracking-tight md:text-6xl">
            Réservez votre table aujourd’hui
          </h3>
          <p className="nd-reveal nd-reveal-d1 mt-6 text-lg text-white/75 md:text-xl">
            Une équipe à votre écoute, du lundi au dimanche.
          </p>
          <div className="nd-reveal nd-reveal-d2 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-6">
            <a
              href="tel:+33123456789"
              className="nd-glow-hover inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-5 text-lg font-bold text-cafe-900 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto md:px-10"
            >
              <Phone className="h-5 w-5" />
              Appeler maintenant
            </a>
            <a
              href="mailto:contact@elnadhour.com"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-5 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/20 sm:w-auto md:px-10"
            >
              Nous écrire
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
