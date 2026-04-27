import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Coffee, Star, Clock, X } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MenuItemDescription from '../components/MenuItemDescription';
import { mediaUrl } from '../utils/mediaUrl';
import { formatPriceDT } from '../utils/formatPrice';

const STICKY_TOP = 'top-16 md:top-[4.25rem]';

const SimpleMenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  const initialCat =
    catParam && /^\d+$/.test(String(catParam)) ? String(catParam) : 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [imagePreview, setImagePreview] = useState(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => api.get('/categories').then((res) => res.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: menuItems, isLoading: itemsLoading } = useQuery(
    'menu-items',
    () => api.get('/menu-items').then((res) => res.data),
    { staleTime: 2 * 60 * 1000 }
  );

  const isLoading = categoriesLoading || itemsLoading;

  /** Sync filtre avec ?cat= (cartes « Nos Spécialités », retour navigateur) */
  useEffect(() => {
    const c = searchParams.get('cat');
    if (!c || !/^\d+$/.test(String(c))) {
      setActiveCategory('all');
      return;
    }
    const idStr = String(c);
    if (categories?.length && !categories.some((cat) => String(cat.id) === idStr)) {
      setActiveCategory('all');
      setSearchParams({}, { replace: true });
      return;
    }
    setActiveCategory(idStr);
  }, [searchParams, categories, setSearchParams]);

  const setCategory = useCallback(
    (id) => {
      const next = id === 'all' ? 'all' : String(id);
      setActiveCategory(next);
      if (next === 'all') {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ cat: next }, { replace: true });
      }
    },
    [setSearchParams]
  );

  /** Après chargement : aller en haut ou jusqu’à la section de la catégorie */
  useEffect(() => {
    if (isLoading) return;
    const run = () => {
      if (activeCategory === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document
        .getElementById(`menu-cat-${activeCategory}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const id = window.requestAnimationFrame(run);
    return () => window.cancelAnimationFrame(id);
  }, [activeCategory, isLoading]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setImagePreview(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredItems =
    menuItems?.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        activeCategory === 'all' || item.category_id.toString() === activeCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  const groupedItems =
    categories?.reduce((acc, category) => {
      const categoryItems = filteredItems.filter((item) => item.category_id === category.id);
      if (categoryItems.length > 0) {
        acc[category.id] = { category, items: categoryItems };
      }
      return acc;
    }, {}) || {};

  const categoryPillClass = (isActive) =>
    `px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border ${
      isActive
        ? 'bg-white text-cafe-900 border-white shadow-md'
        : 'bg-white/5 text-white border-white/15 hover:bg-white/15 hover:border-white/25'
    }`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 flex items-center justify-center">
        <LoadingSpinner text="Chargement du menu..." />
      </div>
    );
  }

  const menuBody =
    Object.keys(groupedItems).length === 0 ? (
      <div className="text-center py-12 md:py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-cafe-100 rounded-full mb-6">
          <Coffee className="h-10 w-10 text-cafe-600" />
        </div>
        <h3 className="text-2xl font-semibold text-cafe-900 mb-2">Aucun résultat</h3>
        <p className="text-cafe-600">Essayez avec d'autres mots-clés</p>
      </div>
    ) : (
      <div className="space-y-8 md:space-y-12">
        {Object.values(groupedItems).map(({ category, items }) => (
          <div
            key={category.id}
            id={`menu-cat-${category.id}`}
            className="scroll-mt-28 space-y-4 md:scroll-mt-36 md:space-y-6"
          >
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg">
                <div className="w-2 h-2 bg-cafe-700 rounded-full" />
                <h2 className="text-2xl md:text-3xl font-display font-bold text-cafe-900">{category.name}</h2>
                <div className="w-2 h-2 bg-cafe-700 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:items-stretch">
              {items.map((item) => {
                const hasPromo =
                  Boolean(item.promotion_text?.trim()) || item.promotion_price != null;
                const hasNew = Boolean(item.is_new);

                const articleBase =
                  'group flex h-full min-h-[200px] cursor-pointer flex-col overflow-hidden rounded-xl border shadow-md transition-all hover:shadow-lg md:min-h-[220px]';

                let articleVariant;
                if (hasPromo) {
                  articleVariant =
                    'promo-glow-border border-amber-300/80 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/45 shadow-[0_0_0_1px_rgba(251,191,36,0.4),0_10px_24px_rgba(217,119,6,0.2)] hover:shadow-[0_0_0_1px_rgba(251,191,36,0.55),0_14px_30px_rgba(217,119,6,0.28)]';
                } else if (hasNew) {
                  articleVariant =
                    'border-emerald-200/70 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/35 hover:shadow-xl';
                } else {
                  articleVariant = 'border-cafe-200/60 bg-white/95';
                }

                return (
                <article
                  key={item.id}
                  className={`${articleBase} ${articleVariant}`}
                  onClick={() =>
                    setImagePreview({
                      src: mediaUrl(item.image_url) || '/placeholder-food.svg',
                      title: item.name,
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setImagePreview({
                        src: mediaUrl(item.image_url) || '/placeholder-food.svg',
                        title: item.name,
                      });
                    }
                  }}
                >
                  <div className="flex min-h-0 flex-1 flex-col md:flex-row md:items-stretch">
                    <div className="relative h-36 w-full shrink-0 overflow-hidden bg-cafe-100 md:h-auto md:w-44 md:min-h-[11rem]">
                      <img
                        src={mediaUrl(item.image_url) || '/placeholder-food.svg'}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/placeholder-food.svg';
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                      {item.is_new && (
                        <div className="absolute right-0 top-0 z-10 h-16 w-16 overflow-hidden">
                          <div className="absolute -right-8 top-3 w-28 rotate-45 bg-gradient-to-b from-red-500 to-red-700 py-1 text-center text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-md">
                            Nouveau
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4">
                      <div className="flex shrink-0 justify-between gap-3">
                        <div className="min-w-0 pr-1">
                          <h3 className="text-lg font-display font-bold text-cafe-900 md:text-xl">{item.name}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cafe-600 md:text-sm">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                              Frais du jour
                            </span>
                            {item.is_recommended && (
                              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                                <Star className="mr-1 h-3 w-3 fill-current text-amber-500 md:h-3.5 md:w-3.5" />
                                Recommandé
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5 self-start">
                          <div
                            className={
                              item.promotion_price
                                ? 'rounded-md bg-cafe-700 py-1.5 pl-2 pr-3 text-right text-white shadow-sm'
                                : 'rounded-md bg-cafe-700 px-3 py-1.5 text-white'
                            }
                          >
                            {item.promotion_price ? (
                              <div className="flex items-stretch justify-end gap-2.5 leading-tight">
                                <span
                                  className="w-0.5 shrink-0 self-stretch rounded-full bg-amber-400"
                                  aria-hidden
                                />
                                <div className="min-w-0 text-right">
                                  <div className="text-[11px] text-white/65 line-through">
                                    {formatPriceDT(item.price)}
                                  </div>
                                  <span className="text-base font-bold md:text-lg">
                                    {formatPriceDT(item.promotion_price)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-base font-bold md:text-lg">
                                {formatPriceDT(item.price)}
                              </span>
                            )}
                          </div>
                          {item.promotion_text && (
                            <span className="relative inline-flex items-center overflow-hidden rounded-md border border-amber-300/70 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-950 shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_6px_14px_rgba(217,119,6,0.22)]">
                              <span className="pointer-events-none absolute inset-y-0 -left-8 w-6 rotate-12 bg-white/70 blur-[1px]" />
                              <span className="relative">Offre</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex min-h-0 flex-1 flex-col">
                        {item.description ? (
                          <div className="min-h-0 flex-1 max-w-none">
                            <MenuItemDescription text={item.description} />
                          </div>
                        ) : (
                          <div className="flex-1" aria-hidden />
                        )}
                        {item.promotion_text && (
                          <div className="mt-2 rounded-lg border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-3 py-2.5 shadow-sm">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(251,191,36,0.15)]" />
                              <div className="min-w-0">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-800">
                                  Offre spéciale
                                </p>
                                <p className="mt-0.5 text-xs font-medium leading-relaxed text-amber-900">
                                  {item.promotion_text}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 via-white to-cafe-100">
      <div className="relative overflow-hidden">
        {/* Dégradé café animé : bande 200% + translate (CSS global, plus fiable que background-position) */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="menu-hero-gradient-slide" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full mb-4">
            <img src="/icon.png" alt="El Nadhour" className="h-20 w-20" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-3">Notre Menu</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6">
            Découvrez nos spécialités artisanales préparées avec passion
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cafe-600" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-0 shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none text-cafe-900"
            />
          </div>
        </div>
        
      </div>

      <div
        className={`sticky ${STICKY_TOP} z-40 border-b border-white/10 bg-cafe-900 shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={categoryPillClass(activeCategory === 'all')}
            >
              Tout voir
            </button>
            {categories?.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategory(category.id)}
                className={categoryPillClass(activeCategory === category.id.toString())}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-10">{menuBody}</div>

      {imagePreview && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setImagePreview(null)}
          role="presentation"
        >
          <div
            className="relative inline-flex max-h-[90vh] max-w-[95vw] items-end justify-center"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Aperçu image de ${imagePreview.title}`}
          >
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
              aria-label="Fermer l'aperçu"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={imagePreview.src}
              alt={imagePreview.title}
              className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/placeholder-food.svg';
              }}
            />
            <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/55 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              {imagePreview.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMenuPage;
