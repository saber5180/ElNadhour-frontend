import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Clock, Star, Sparkles } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MenuItemDescription from '../components/MenuItemDescription';
import { mediaUrl } from '../utils/mediaUrl';
import { formatPriceDT } from '../utils/formatPrice';

const CategoryPage = () => {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: category, isLoading: categoryLoading } = useQuery(
    ['category', id],
    () => api.get(`/categories/${id}`).then((res) => res.data),
    { staleTime: 5 * 60 * 1000, enabled: Boolean(id) }
  );

  const { data: menuItems, isLoading: itemsLoading } = useQuery(
    ['menuItems', id],
    () => api.get(`/menu-items?category_id=${id}`).then((res) => res.data),
    { staleTime: 2 * 60 * 1000, enabled: Boolean(id) }
  );

  const isLoading = categoryLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Chargement de la catégorie..." />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-4">
            Catégorie introuvable
          </h2>
          <Link to="/carte" className="btn-primary">
            Retour au menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cafe-50/40 via-white to-cafe-50/30">
      {/* Header with Category Image — cinematic */}
      <div className="relative h-[22rem] overflow-hidden md:h-[26rem]">
        <img
          src={mediaUrl(category.image_url) || '/placeholder-category.svg'}
          alt={category.name}
          className="h-full w-full scale-[1.04] object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-category.svg';
          }}
        />
        {/* Voile dégradé chaleureux */}
        <div className="absolute inset-0 bg-gradient-to-r from-cafe-900/85 via-cafe-900/55 to-cafe-800/45" />
        {/* Halos */}
        <span className="nd-orb nd-orb--a" aria-hidden />
        <span className="nd-orb nd-orb--b" aria-hidden />
        <span className="nd-grain" aria-hidden />
        {/* Fond doux vers la section suivante */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white"
          aria-hidden
        />

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="px-6 text-center text-white">
            <span className="nd-hero-rise nd-delay-1 mb-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Catégorie
            </span>
            <h1 className="nd-hero-rise nd-delay-2 mb-4 font-display text-4xl font-bold tracking-tight drop-shadow-[0_2px_18px_rgba(15,37,41,0.55)] md:text-6xl">
              {category.name}
            </h1>
            <p className="nd-hero-rise nd-delay-3 text-base text-white/95 drop-shadow-[0_1px_10px_rgba(15,37,41,0.45)] md:text-xl">
              Découvrez notre sélection de {category.name.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/carte"
            className="inline-flex items-center text-cafe-600 hover:text-cafe-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au menu
          </Link>
        </div>

        {/* Menu Items */}
        {menuItems && menuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item, i) => (
              <div
                key={item.id}
                className={`nd-reveal nd-reveal-d${(i % 4) + 1} nd-card-lift card group relative overflow-hidden transition-colors`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={mediaUrl(item.image_url) || '/placeholder-food.jpg'}
                    alt={item.name}
                    className="h-56 w-full object-cover transition-transform duration-[650ms] ease-out group-hover:scale-[1.08]"
                    onError={(e) => {
                      e.target.src = '/placeholder-food.svg';
                    }}
                  />
                  {/* Shine sweep premium */}
                  <span className="nd-shine" aria-hidden />
                  {/* Voile bas pour le contraste du prix */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cafe-900/30 to-transparent"
                    aria-hidden
                  />
                  {/* Price Badge */}
                  <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 shadow-md shadow-cafe-900/10 ring-1 ring-white/60 backdrop-blur-sm">
                    <span className="text-lg font-bold text-cafe-900">
                      {formatPriceDT(item.price)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-3 font-display text-xl font-semibold text-cafe-900">
                    {item.name}
                  </h3>

                  {item.description && (
                    <div className="mb-4">
                      <MenuItemDescription text={item.description} />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cafe-500">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 shrink-0" />
                        <span>Frais du jour</span>
                      </div>
                      {item.is_recommended && (
                        <div className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                          <Star className="mr-1 h-3.5 w-3.5 fill-current text-amber-500" />
                          <span>Recommandé</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <Clock className="h-16 w-16 text-cafe-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-cafe-900 mb-4">
                Bientôt disponible
              </h3>
              <p className="text-cafe-600 mb-8">
                Nous travaillons actuellement sur cette catégorie. 
                Revenez bientôt pour découvrir nos nouvelles spécialités !
              </p>
              <Link to="/carte" className="btn-primary">
                Explorer d'autres catégories
              </Link>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {menuItems && menuItems.length > 0 && (
          <div className="mt-16 text-center bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-display font-semibold text-cafe-900 mb-4">
              Envie de goûter ?
            </h3>
            <p className="text-cafe-600 mb-6">
              Venez nous rendre visite pour déguster nos spécialités fraîchement préparées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/reservation" className="btn-primary">
                Réserver une table
              </Link>
              <Link to="/carte" className="btn-secondary">
                Voir tout le menu
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;