import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Utensils,
  X,
  Upload,
  Search,
  Filter,
  Star
} from 'lucide-react';
import api from '../../services/api';
import { mediaUrl } from '../../utils/mediaUrl';
import { formatPriceDT } from '../../utils/formatPrice';
import LoadingSpinner from '../../components/LoadingSpinner';

const MenuItemsManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Fetch categories for dropdown
  const { data: categories } = useQuery(
    'admin-categories',
    () => api.get('/categories').then(res => res.data),
    { staleTime: 5 * 60 * 1000 }
  );

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery(
    'admin-menu-items',
    () => api.get('/menu-items').then(res => res.data),
    { staleTime: 2 * 60 * 1000 }
  );

  // Create menu item mutation
  const createMutation = useMutation(
    (formData) => api.post('/menu-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-menu-items');
        toast.success('Article créé avec succès');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la création');
      }
    }
  );

  // Update menu item mutation
  const updateMutation = useMutation(
    ({ id, formData }) => api.put(`/menu-items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-menu-items');
        toast.success('Article modifié avec succès');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la modification');
      }
    }
  );

  // Delete menu item mutation
  const deleteMutation = useMutation(
    (id) => api.delete(`/menu-items/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-menu-items');
        toast.success('Article supprimé avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  );

  // Filter menu items
  const filteredItems = menuItems?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category_id.toString() === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setImagePreview(item?.image_url || null);
    setSelectedFile(null);

    if (item) {
      reset({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category_id: item.category_id,
        image_url: item.image_url || '',
        is_recommended: Boolean(item.is_recommended),
      });
    } else {
      reset({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        is_recommended: false,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImagePreview(null);
    setSelectedFile(null);
    reset();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', parseFloat(data.price));
    formData.append('category_id', parseInt(data.category_id));
    formData.append('is_recommended', data.is_recommended ? '1' : '0');

    if (selectedFile) {
      formData.append('image', selectedFile);
    } else if (data.image_url) {
      formData.append('image_url', data.image_url);
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (item) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Gestion du menu
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez les articles de votre menu
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel article
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input pl-10 pr-8 appearance-none"
          >
            <option value="">Toutes les catégories</option>
            {categories?.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Table */}
      {isLoading ? (
        <LoadingSpinner text="Chargement des articles..." />
      ) : (
        <div className="card overflow-hidden">
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix (DT)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={mediaUrl(item.image_url) || '/placeholder-food.jpg'}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-food.svg';
                        }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.is_recommended ? (
                          <span className="inline-flex items-center gap-1 text-amber-700" title="Mis en avant sur la carte">
                            <Star className="h-4 w-4 fill-current shrink-0" />
                            Oui
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-cafe-700">
                        {formatPriceDT(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="text-cafe-600 hover:text-cafe-900 p-2"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterCategory ? 'Aucun article trouvé' : 'Aucun article créé'}
              </p>
              {!searchTerm && !filterCategory && (
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 text-cafe-600 hover:text-cafe-900 font-medium"
                >
                  Créer votre premier article
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <label className="form-label">Nom de l'article</label>
                        <input
                          type="text"
                          className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="ex: Croissant au beurre"
                          {...register('name', {
                            required: 'Le nom est requis',
                            minLength: {
                              value: 2,
                              message: 'Le nom doit contenir au moins 2 caractères'
                            }
                          })}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Description Field */}
                      <div>
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-input h-24 resize-none"
                          placeholder="Décrivez l'article..."
                          {...register('description')}
                        />
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-cafe-100 bg-cafe-50/40 px-3 py-3">
                        <input
                          id="is_recommended"
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cafe-700 focus:ring-cafe-500"
                          {...register('is_recommended')}
                        />
                        <label htmlFor="is_recommended" className="text-sm text-gray-700 cursor-pointer leading-snug">
                          <span className="font-medium text-gray-900">Recommandé</span>
                          <span className="block text-gray-500 mt-0.5">
                            Badge visible sur la page publique du menu (/carte et fiches catégorie).
                          </span>
                        </label>
                      </div>

                      {/* Price Field */}
                      <div>
                        <label className="form-label">Prix (DT)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                          placeholder="0.00"
                          {...register('price', {
                            required: 'Le prix est requis',
                            min: {
                              value: 0,
                              message: 'Le prix doit être positif'
                            }
                          })}
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                        )}
                      </div>

                      {/* Category Field */}
                      <div>
                        <label className="form-label">Catégorie</label>
                        <select
                          className={`form-input ${errors.category_id ? 'border-red-500' : ''}`}
                          {...register('category_id', {
                            required: 'La catégorie est requise'
                          })}
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories?.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.category_id && (
                          <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Image */}
                    <div>
                      <label className="form-label">Image</label>
                      
                      {/* File input */}
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          {imagePreview ? (
                            <div className="mb-4">
                              <img
                                src={imagePreview}
                                alt="Aperçu"
                                className="mx-auto h-32 w-32 object-cover rounded-lg"
                              />
                            </div>
                          ) : (
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          )}
                          
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-cafe-600 hover:text-cafe-500">
                              <span>Télécharger une image</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
                        </div>
                      </div>

                      {/* URL alternative */}
                      <div className="mt-4">
                        <input
                          type="url"
                          className="form-input"
                          placeholder="Ou URL d'image"
                          {...register('image_url')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center btn-primary sm:ml-3 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner mr-2"></div>
                        {editingItem ? 'Modification...' : 'Création...'}
                      </>
                    ) : (
                      editingItem ? 'Modifier' : 'Créer'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center btn-secondary sm:mt-0 sm:w-auto"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemsManager;