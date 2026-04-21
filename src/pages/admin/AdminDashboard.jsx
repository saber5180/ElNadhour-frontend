import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FolderOpen, 
  Utensils, 
  TrendingUp, 
  Clock,
  Plus,
  Eye,
  Image
} from 'lucide-react';
import api from '../../services/api';
import { mediaUrl } from '../../utils/mediaUrl';
import { formatPriceEUR } from '../../utils/formatPrice';
import LoadingSpinner from '../../components/LoadingSpinner';
import LiveStreamManager from '../../components/admin/LiveStreamManager';

const AdminDashboard = () => {
  // Fetch dashboard statistics
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery(
    'admin-categories',
    () => api.get('/categories').then((res) => res.data),
    { staleTime: 2 * 60 * 1000 }
  );

  const { data: menuItems, isLoading: itemsLoading, error: itemsError } = useQuery(
    'admin-menu-items',
    () => api.get('/menu-items').then((res) => res.data),
    { staleTime: 2 * 60 * 1000 }
  );

  const isLoading = categoriesLoading || itemsLoading;

  const stats = [
    {
      name: 'Catégories',
      value: categories?.length || 0,
      icon: FolderOpen,
      link: '/admin/categories',
    },
    {
      name: 'Articles du menu',
      value: menuItems?.length || 0,
      icon: Utensils,
      link: '/admin/articles',
    },
    {
      name: 'Dernière mise à jour',
      value: "Aujourd'hui",
      icon: Clock,
      link: null,
    },
    {
      name: 'Statut',
      value: 'Actif',
      icon: TrendingUp,
      link: null,
    },
  ];

  const quickActions = [
    {
      name: 'Photos de l’accueil',
      description: 'Bandeau défilant derrière le titre sur la page d’accueil',
      icon: Image,
      link: '/admin/medias-accueil',
    },
    {
      name: 'Ajouter une catégorie',
      description: 'Créer une nouvelle catégorie de menu',
      icon: FolderOpen,
      link: '/admin/categories',
    },
    {
      name: 'Ajouter un article',
      description: 'Ajouter un nouvel article au menu',
      icon: Plus,
      link: '/admin/articles',
    },
    {
      name: 'Voir le site',
      description: 'Visualiser le site public',
      icon: Eye,
      link: '/',
      external: true,
    },
  ];

  const recentItems = menuItems?.slice(-5) || [];

  return (
    <div className="space-y-10">
      <div className="border-b border-cafe-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cafe-600">Vue d’ensemble</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-cafe-900 md:text-4xl">
          Tableau de bord
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-cafe-700 md:text-base">
          Gérez le menu, les médias et le live. Les prix affichés côté site sont en <strong>euros (€)</strong>.
        </p>
      </div>

      {(categoriesError || itemsError) && (
        <div className="rounded-xl border border-red-200 bg-red-50/90 p-4">
          <h3 className="font-semibold text-red-900">Erreur API</h3>
          {categoriesError && <p className="mt-1 text-sm text-red-800">Catégories : {categoriesError.message}</p>}
          {itemsError && <p className="mt-1 text-sm text-red-800">Articles : {itemsError.message}</p>}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner text="Chargement des statistiques..." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-2xl border border-cafe-200/90 bg-white p-5 shadow-sm transition hover:border-cafe-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-cafe-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-cafe-900">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cafe-100 text-cafe-800">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="mt-4 inline-flex text-sm font-semibold text-cafe-800 hover:text-cafe-900"
                >
                  Ouvrir →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-cafe-600">Raccourcis</h2>
        <p className="mt-1 text-lg font-semibold text-cafe-900">Actions rapides</p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.link}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className="group rounded-2xl border border-cafe-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cafe-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cafe-700 text-white transition group-hover:bg-cafe-800">
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-cafe-900">{action.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cafe-700">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <LiveStreamManager />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-cafe-600">Menu</h2>
          <p className="mt-1 text-lg font-semibold text-cafe-900">Articles récents</p>
          {isLoading ? (
            <div className="mt-6">
              <LoadingSpinner size="sm" text="Chargement..." />
            </div>
          ) : recentItems.length > 0 ? (
            <div className="mt-5 space-y-3">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-cafe-200/90 bg-white p-3 shadow-sm"
                >
                  <img
                    src={mediaUrl(item.image_url) || '/placeholder-food.jpg'}
                    alt={item.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-food.svg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-cafe-900">{item.name}</h4>
                    <p className="truncate text-sm text-cafe-600">{item.category_name}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-cafe-800">
                    {formatPriceEUR(item.price)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-cafe-300 bg-cafe-50/80 py-10 text-center">
              <Utensils className="mx-auto mb-3 h-10 w-10 text-cafe-400" />
              <p className="text-sm text-cafe-700">Aucun article pour le moment</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-cafe-600">Structure</h2>
          <p className="mt-1 text-lg font-semibold text-cafe-900">Catégories</p>
          {isLoading ? (
            <div className="mt-6">
              <LoadingSpinner size="sm" text="Chargement..." />
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="mt-5 space-y-3">
              {categories.map((category) => {
                const itemCount = menuItems?.filter((it) => it.category_id === category.id).length || 0;
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-cafe-200/90 bg-white p-3 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={mediaUrl(category.image_url) || '/placeholder-category.svg'}
                        alt={category.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-category.svg';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="truncate font-medium text-cafe-900">{category.name}</h4>
                        <p className="text-sm text-cafe-600">
                          {itemCount} article{itemCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/admin/categories"
                      className="shrink-0 text-sm font-semibold text-cafe-800 hover:text-cafe-900"
                    >
                      Gérer →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-cafe-300 bg-cafe-50/80 py-10 text-center">
              <FolderOpen className="mx-auto mb-3 h-10 w-10 text-cafe-400" />
              <p className="text-sm text-cafe-700">Aucune catégorie</p>
              <Link to="/admin/categories" className="mt-2 inline-block text-sm font-semibold text-emerald-800">
                Créer une catégorie →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;