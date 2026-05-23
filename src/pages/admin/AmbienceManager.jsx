import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  FolderPlus,
  ImagePlus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react';
import api from '../../services/api';
import { mediaUrl } from '../../utils/mediaUrl';
import LoadingSpinner from '../../components/LoadingSpinner';
import AmbienceMediaThumb from '../../components/AmbienceMediaThumb';
import { isVideoStory, mediaCountLabel } from '../../utils/ambienceMedia';

function folderCover(folder) {
  return folder.cover_image_url || folder.stories?.[0]?.image_url || null;
}

const AmbienceManager = () => {
  const queryClient = useQueryClient();
  const folderFileRef = useRef(null);
  const storyFileRefs = useRef({});

  const [expandedId, setExpandedId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderFile, setNewFolderFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [storyCaptions, setStoryCaptions] = useState({});

  const { data: folders = [], isLoading } = useQuery('ambience-admin', () =>
    api.get('/ambience').then((r) => r.data)
  );

  const invalidate = () => {
    queryClient.invalidateQueries('ambience-admin');
    queryClient.invalidateQueries('ambience');
  };

  const createFolderMutation = useMutation(
    (formData) => api.post('/ambience/folders', formData),
    {
      onSuccess: () => {
        invalidate();
        toast.success('Dossier créé');
        setNewFolderName('');
        setNewFolderFile(null);
        if (folderFileRef.current) folderFileRef.current.value = '';
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Échec de la création'),
    }
  );

  const updateFolderMutation = useMutation(
    ({ id, formData }) => api.put(`/ambience/folders/${id}`, formData),
    {
      onSuccess: () => {
        invalidate();
        toast.success('Dossier mis à jour');
        setEditingId(null);
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Échec de la mise à jour'),
    }
  );

  const deleteFolderMutation = useMutation((id) => api.delete(`/ambience/folders/${id}`), {
    onSuccess: () => {
      invalidate();
      toast.success('Dossier supprimé');
    },
    onError: () => toast.error('Suppression impossible'),
  });

  const createStoryMutation = useMutation(
    ({ folderId, formData }) => api.post(`/ambience/folders/${folderId}/stories`, formData),
    {
      onSuccess: (_, { folderId }) => {
        invalidate();
        toast.success('Média ajouté au dossier');
        setStoryCaptions((prev) => ({ ...prev, [folderId]: '' }));
        const ref = storyFileRefs.current[folderId];
        if (ref) ref.value = '';
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Échec de l’envoi'),
    }
  );

  const deleteStoryMutation = useMutation((id) => api.delete(`/ambience/stories/${id}`), {
    onSuccess: () => {
      invalidate();
      toast.success('Média supprimé');
    },
    onError: () => toast.error('Suppression impossible'),
  });

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.error('Nom du dossier requis');
      return;
    }
    const fd = new FormData();
    fd.append('name', newFolderName.trim());
    if (newFolderFile) fd.append('image', newFolderFile);
    createFolderMutation.mutate(fd);
  };

  const handleSaveEdit = (folder) => {
    if (!editName.trim()) {
      toast.error('Nom requis');
      return;
    }
    const fd = new FormData();
    fd.append('name', editName.trim());
    updateFolderMutation.mutate({ id: folder.id, formData: fd });
  };

  const handleAddStory = (folderId, file) => {
    if (!file?.type.startsWith('image/') && !file?.type.startsWith('video/')) {
      toast.error('Choisissez une image ou une vidéo');
      return;
    }
    const fd = new FormData();
    fd.append('image', file);
    const cap = storyCaptions[folderId]?.trim();
    if (cap) fd.append('caption', cap);
    createStoryMutation.mutate({ folderId, formData: fd });
  };

  if (isLoading) {
    return <LoadingSpinner text="Chargement de l’ambiance…" />;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-cafe-100 p-3">
          <Sparkles className="h-7 w-7 text-cafe-800" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambiance</h1>
          <p className="text-sm text-gray-600">
            Créez des dossiers (Anniversaire, Événements…) avec des photos et vidéos type « stories »,
            visibles dans l’en-tête du site.
          </p>
        </div>
      </div>

      {/* Nouveau dossier */}
      <form
        onSubmit={handleCreateFolder}
        className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FolderPlus className="h-5 w-5 text-cafe-700" />
          Nouveau dossier
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Nom du dossier</label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ex. Anniversaire, Soirée jazz…"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-cafe-600 focus:outline-none focus:ring-2 focus:ring-cafe-600/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Couverture (optionnel)</label>
            <input
              ref={folderFileRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-600"
              onChange={(e) => setNewFolderFile(e.target.files?.[0] || null)}
            />
          </div>
          <button
            type="submit"
            disabled={createFolderMutation.isLoading}
            className="rounded-lg bg-cafe-700 px-5 py-2.5 font-semibold text-white hover:bg-cafe-800 disabled:opacity-50"
          >
            {createFolderMutation.isLoading ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>

      {folders.length === 0 ? (
        <p className="rounded-lg border border-cafe-100 bg-cafe-50 p-6 text-gray-600">
          Aucun dossier pour l’instant. Créez un dossier puis ajoutez-y des photos pour qu’il apparaisse dans
          la barre « Ambiance ».
        </p>
      ) : (
        <ul className="space-y-4">
          {folders.map((folder) => {
            const expanded = expandedId === folder.id;
            const cover = folderCover(folder);
            const isEditing = editingId === folder.id;

            return (
              <li
                key={folder.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-cafe-400 via-cafe-600 to-cafe-800 p-[2px]">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                      {cover ? (
                        <img src={mediaUrl(cover)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Sparkles className="h-6 w-6 text-cafe-400" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(folder)}
                          className="rounded-lg bg-cafe-700 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-500"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="truncate font-semibold text-gray-900">{folder.name}</p>
                        <p className="text-xs text-gray-500">
                          {mediaCountLabel(folder.stories?.length ?? 0)}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(folder.id);
                          setEditName(folder.name);
                        }}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        aria-label="Renommer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Supprimer le dossier « ${folder.name} » et toutes ses photos ?`)) {
                          deleteFolderMutation.mutate(folder.id);
                        }
                      }}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label="Supprimer le dossier"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : folder.id)}
                      className="rounded-lg p-2 text-cafe-700 hover:bg-cafe-50"
                      aria-expanded={expanded}
                    >
                      {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Légende (optionnelle)
                        </label>
                        <input
                          type="text"
                          value={storyCaptions[folder.id] || ''}
                          onChange={(e) =>
                            setStoryCaptions((prev) => ({ ...prev, [folder.id]: e.target.value }))
                          }
                          placeholder="Texte sous le média…"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <input
                          ref={(el) => {
                            storyFileRefs.current[folder.id] = el;
                          }}
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAddStory(folder.id, file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => storyFileRefs.current[folder.id]?.click()}
                          disabled={createStoryMutation.isLoading}
                          className="inline-flex items-center gap-2 rounded-lg bg-cafe-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cafe-800 disabled:opacity-50"
                        >
                          <ImagePlus className="h-4 w-4" />
                          Ajouter photo / vidéo
                        </button>
                      </div>
                    </div>

                    {!folder.stories?.length ? (
                      <p className="text-sm text-gray-500">Aucun média dans ce dossier.</p>
                    ) : (
                      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {folder.stories.map((story) => (
                          <li
                            key={story.id}
                            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                          >
                            <div className="relative aspect-[3/4] w-full overflow-hidden">
                              <AmbienceMediaThumb story={story} className="h-full w-full object-cover" />
                              {isVideoStory(story) && (
                                <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                                  Vidéo
                                </span>
                              )}
                            </div>
                            {story.caption && (
                              <p className="truncate px-2 py-1.5 text-xs text-gray-600">{story.caption}</p>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Supprimer ce média ?')) {
                                  deleteStoryMutation.mutate(story.id);
                                }
                              }}
                              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AmbienceManager;
