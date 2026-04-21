import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-react';
import api from '../../services/api';
import { mediaUrl } from '../../utils/mediaUrl';
import LoadingSpinner from '../../components/LoadingSpinner';

const CategoriesManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  // Fetch categories
  const { data: categories, isLoading } = useQuery(
    'admin-categories',
    () => api.get('/categories').then(res => res.data),
    { staleTime: 2 * 60 * 1000 }
  );

  // Create category mutation
  const createMutation = useMutation(
    (formData) => api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-categories');
        toast.success('Catégorie créée avec succès');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la création');
      }
    }
  );

  // Update category mutation
  const updateMutation = useMutation(
    ({ id, formData }) => api.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-categories');
        toast.success('Catégorie modifiée avec succès');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la modification');
      }
    }
  );

  // Delete category mutation
  const deleteMutation = useMutation(
    (id) => api.delete(`/categories/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-categories');
        toast.success('Catégorie supprimée avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  );

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    setImagePreview(category?.image_url || null);
    setSelectedFile(null);
    
    if (category) {
      setValue('name', category.name);
      setValue('image_url', category.image_url || '');
    } else {
      reset();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
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
    
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else if (data.image_url) {
      formData.append('image_url', data.image_url);
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (category) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Gestion des catégories
          </h1>
          <p className="mt-2 text-gray-600">
            Créez et gérez les catégories de votre menu
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle catégorie
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <LoadingSpinner text="Chargement des catégories..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories?.map((category) => (
            <div key={category.id} className="card overflow-hidden group">
              <div className="relative">
                <img
                  src={mediaUrl(category.image_url) || '/placeholder-category.svg'}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-category.svg';
                  }}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-center">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Créé le {new Date(category.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          )) || []}
          
          {/* Empty state */}
          {categories?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune catégorie créée</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 text-cafe-600 hover:text-cafe-900 font-medium"
              >
                Créer votre première catégorie
              </button>
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

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="form-label">Nom de la catégorie</label>
                      <input
                        type="text"
                        className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="ex: Petit-déjeuner"
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

                    {/* Image Upload */}
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
                        <label className="form-label">Ou URL d'image</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://exemple.com/image.jpg"
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
                        {editingCategory ? 'Modification...' : 'Création...'}
                      </>
                    ) : (
                      editingCategory ? 'Modifier' : 'Créer'
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

export default CategoriesManager;