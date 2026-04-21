import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Grid, List, Star } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MenuItemDescription from '../components/MenuItemDescription';
import { mediaUrl } from '../utils/mediaUrl';
import { formatPriceEUR } from '../utils/formatPrice';

const MenuPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => api.get('/categories').then(res => res.data),
    { staleTime: 5 * 60 * 1000 }
  );

  // Search menu items
  const { data: searchResults, isLoading: searchLoading } = useQuery(
    ['search', searchTerm],
    () => api.get(`/menu-items/search?q=${searchTerm}`).then(res => res.data),
    {
      enabled: searchTerm.length >= 2,
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  const isLoading = categoriesLoading || searchLoading;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const isSearching = searchTerm.length >= 2;

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">Notre Menu</h1>
          <p className="section-subtitle">
            Explorez nos différentes catégories et trouvez vos plats préférés
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cafe-500" />
            <input
              type="text"
              placeholder="Rechercher un plat, une boisson..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-12 pr-4 py-4 text-lg"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        {!isSearching && (
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-cafe-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-cafe-700 text-white'
                    : 'text-cafe-600 hover:text-cafe-900'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-cafe-700 text-white'
                    : 'text-cafe-600 hover:text-cafe-900'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <LoadingSpinner text="Chargement du menu..." />
        )}

        {/* Search Results */}
        {isSearching && !searchLoading && searchResults && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-semibold text-cafe-900 mb-6">
              Résultats de recherche pour "{searchTerm}"
            </h2>
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-cafe-600 text-lg">
                  Aucun résultat trouvé pour votre recherche.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((item) => (
                  <div key={item.id} className="card overflow-hidden">
                    <img
                      src={mediaUrl(item.image_url) || '/placeholder-food.jpg'}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-food.svg';
                    }}
                    />
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-cafe-900">
                          {item.name}
                        </h3>
                        <span className="text-lg font-bold text-cafe-700">
                          {formatPriceEUR(item.price)}
                        </span>
                      </div>
                      <p className="text-cafe-600 text-sm mb-2">
                        {item.category_name}
                      </p>
                      {item.is_recommended && (
                        <div className="mb-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                          <Star className="h-3.5 w-3.5 mr-1 fill-current text-amber-500" />
                          Recommandé
                        </div>
                      )}
                      {item.description && (
                        <div className="text-cafe-700">
                          <MenuItemDescription text={item.description} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Grid/List */}
        {!isSearching && categories && (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
              : 'space-y-6'
          }>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categorie/${category.id}`}
                className={`card group overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={viewMode === 'list' ? 'w-1/3' : 'w-full'}>
                  <img
                    src={mediaUrl(category.image_url) || '/placeholder-category.svg'}
                    alt={category.name}
                    className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                      viewMode === 'list' ? 'h-full w-full' : 'w-full h-56'
                    }`}
                    onError={(e) => {
                      e.target.src = '/placeholder-category.svg';
                    }}
                  />
                </div>
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex items-center' : ''}`}>
                  <div className={viewMode === 'list' ? 'w-full' : 'text-center'}>
                    <h3 className="text-xl font-display font-semibold text-cafe-900 group-hover:text-cafe-700 transition-colors">
                      {category.name}
                    </h3>
                    {viewMode === 'list' && (
                      <p className="text-cafe-600 mt-2">
                        Découvrez notre sélection de {category.name.toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isSearching && categories && categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-cafe-600 text-lg">
              Aucune catégorie disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;