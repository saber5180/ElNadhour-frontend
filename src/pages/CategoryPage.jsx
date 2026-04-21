import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Clock, Star } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MenuItemDescription from '../components/MenuItemDescription';
import { mediaUrl } from '../utils/mediaUrl';
import { formatPriceEUR } from '../utils/formatPrice';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Category Image */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={mediaUrl(category.image_url) || '/placeholder-category.svg'}
          alt={category.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-category.svg';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              {category.name}
            </h1>
            <p className="text-xl opacity-90">
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
            {menuItems.map((item) => (
              <div key={item.id} className="card overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img
                    src={mediaUrl(item.image_url) || '/placeholder-food.jpg'}
                    alt={item.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/placeholder-food.svg';
                    }}
                  />
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-cafe-900 font-bold text-lg">
                      {formatPriceEUR(item.price)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-cafe-900 mb-3">
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
                        <Clock className="h-4 w-4 mr-1 shrink-0" />
                        <span>Frais du jour</span>
                      </div>
                      {item.is_recommended && (
                        <div className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                          <Star className="h-3.5 w-3.5 mr-1 fill-current text-amber-500" />
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
              <a href="tel:+33123456789" className="btn-primary">
                Réserver par téléphone
              </a>
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