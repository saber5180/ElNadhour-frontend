import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ImagePlus, Trash2, LayoutTemplate } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { mediaUrl } from '../../utils/mediaUrl';

const HeroImagesManager = () => {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const { data: images = [], isLoading } = useQuery('hero-images-admin', () =>
    api.get('/hero-images').then((r) => r.data)
  );

  const uploadMutation = useMutation(
    (formData) => api.post('/hero-images', formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hero-images-admin');
        queryClient.invalidateQueries('hero-images');
        toast.success('Photo ajoutée à l’accueil');
        if (fileRef.current) fileRef.current.value = '';
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Échec de l’envoi');
      },
      onSettled: () => setUploading(false),
    }
  );

  const deleteMutation = useMutation((id) => api.delete(`/hero-images/${id}`), {
    onSuccess: () => {
      queryClient.invalidateQueries('hero-images-admin');
      queryClient.invalidateQueries('hero-images');
      toast.success('Photo supprimée');
    },
    onError: () => toast.error('Suppression impossible'),
  });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Choisissez une image');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    uploadMutation.mutate(fd);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-cafe-100">
          <LayoutTemplate className="h-7 w-7 text-cafe-800" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photos de l’accueil</h1>
          <p className="text-gray-600 text-sm">
            Bandeau défilant derrière « El Nadhour » — ajoutez plusieurs images pour un défilement fluide.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ajouter une photo
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cafe-700 text-white font-medium hover:bg-cafe-800 disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            {uploading ? 'Envoi…' : 'Choisir une image'}
          </button>
          <span className="text-xs text-gray-500">JPG, PNG, WebP — max 5 Mo</span>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : images.length === 0 ? (
        <p className="text-gray-600 bg-cafe-50 border border-cafe-100 rounded-lg p-6">
          Aucune photo pour l’instant : l’accueil utilise le fond dégradé par défaut. Ajoutez au moins une image
          pour activer le défilement.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img) => (
            <li
              key={img.id}
              className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm"
            >
              <img
                src={mediaUrl(img.image_url)}
                alt=""
                className="w-full h-44 object-cover"
              />
              <div className="p-3 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 truncate font-mono">{img.image_url}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Supprimer cette photo de l’accueil ?')) {
                      deleteMutation.mutate(img.id);
                    }
                  }}
                  className="shrink-0 p-2 rounded-lg text-red-600 hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HeroImagesManager;
