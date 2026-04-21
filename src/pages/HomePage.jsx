import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowRight, Star, Coffee, Utensils, Clock, Phone, MapPin, Award } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import LivePopup from '../components/LivePopup';
import HeroBackground from '../components/HeroBackground';
import { mediaUrl } from '../utils/mediaUrl';

const HomePage = () => {
  const { data: heroPhotos } = useQuery(
    'hero-images',
    () => api.get('/hero-images').then((res) => res.data),
    { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false }
  );
  const hasHeroPhotos = Boolean((heroPhotos ?? []).length);

  // Fetch categories for the preview section
  const { data: categories, isLoading } = useQuery('categories', 
    () => api.get('/categories').then(res => res.data),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  const features = [
    {
      icon: Coffee,
      title: 'Produits Frais',
      description: 'Tous nos produits sont préparés quotidiennement avec des ingrédients de qualité.'
    },
    {
      icon: Utensils,
      title: 'Cuisine Maison',
      description: 'Nos pâtisseries et plats sont faits maison par nos chefs expérimentés.'
    },
    {
      icon: Clock,
      title: 'Service Rapide',
      description: 'Profitez de nos services rapides pour vos pauses déjeuner et petit-déjeuner.'
    },
    {
      icon: Star,
      title: 'Qualité Premium',
      description: 'Une sélection rigoureuse des meilleurs fournisseurs pour une qualité exceptionnelle.'
    }
  ];

  return (
    <div>
      {/* Live Stream Popup */}
      <LivePopup />
      {/* Hero Section - Clean & Modern */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cafe-50 to-cafe-100">
        <HeroBackground />
        {hasHeroPhotos && (
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-cafe-900/70 via-cafe-800/45 to-cafe-900/65"
            aria-hidden
          />
        )}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Logo & Title */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 bg-white rounded-full shadow-lg mb-6">
              <img src="/icon.png" alt="El Nadhour" className="h-[5.5rem] w-[5.5rem] sm:h-24 sm:w-24 object-contain" />
            </div>
            <h1
              className={`text-4xl md:text-7xl font-display font-bold mb-4 ${
                hasHeroPhotos ? 'text-white drop-shadow-md' : 'text-cafe-900'
              }`}
            >
              El Nadhour
            </h1>
            <p
              className={`text-lg md:text-2xl mb-8 ${
                hasHeroPhotos ? 'text-white/95 drop-shadow' : 'text-cafe-700'
              }`}
            >
              Restaurant & Café de qualité
            </p>
          </div>

          {/* Main CTA */}
          <div className="space-y-6">
            <Link 
              to="/carte" 
              className="inline-flex items-center bg-cafe-700 hover:bg-cafe-800 text-white font-bold text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Découvrir Notre Menu
              <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
            </Link>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a 
                href="tel:+33123456789"
                className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-cafe-700 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Phone className="h-5 w-5 mr-2" />
                Nous Appeler
              </a>
              <a 
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-cafe-700 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Nous Trouver
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-cafe-900 mb-12">
            Nos Spécialités
          </h2>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner text="Chargement des spécialités..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/carte?cat=${category.id}`}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={mediaUrl(category.image_url) || '/placeholder-category.svg'}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/placeholder-category.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg text-center">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View Menu */}
          <div className="text-center mt-12">
            <Link
              to="/carte"
              className="inline-flex items-center bg-cafe-600 hover:bg-cafe-700 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Voir Notre Menu
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-cafe-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hours */}
            <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cafe-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-cafe-700" />
              </div>
              <h3 className="text-xl font-bold text-cafe-900 mb-4">Horaires</h3>
              <div className="space-y-2 text-cafe-700">
                <p><strong>Lundi - Vendredi</strong></p>
                <p>7h00 - 19h00</p>
                <p><strong>Samedi - Dimanche</strong></p>
                <p>8h00 - 20h00</p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cafe-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-cafe-700" />
              </div>
              <h3 className="text-xl font-bold text-cafe-900 mb-4">Adresse</h3>
              <div className="space-y-2 text-cafe-700">
                <p>123 Rue de la Paix</p>
                <p>75001 Paris</p>
                <p className="font-semibold">+33 1 23 45 67 89</p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cafe-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-cafe-700" />
              </div>
              <h3 className="text-xl font-bold text-cafe-900 mb-4">Notre Engagement</h3>
              <div className="space-y-3 text-cafe-700">
                <div className="flex items-center justify-center space-x-2">
                  <Coffee className="h-5 w-5 text-cafe-600" />
                  <span>Produits frais du jour</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Utensils className="h-5 w-5 text-cafe-600" />
                  <span>Café artisanal</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Star className="h-5 w-5 text-cafe-600" />
                  <span>Pâtisseries maison</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5 text-cafe-600" />
                  <span>Service rapide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;