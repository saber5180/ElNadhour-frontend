import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Sparkles, Image } from 'lucide-react';
import api from '../services/api';
import { mediaUrl } from '../utils/mediaUrl';
import LoadingSpinner from '../components/LoadingSpinner';
import AmbienceStoryViewer from '../components/AmbienceStoryViewer';
import AmbienceMediaThumb from '../components/AmbienceMediaThumb';
import { isVideoStory, mediaCountLabel } from '../utils/ambienceMedia';

function folderCover(folder) {
  return folder.cover_image_url || folder.stories?.[0]?.image_url || null;
}

export default function AmbiencePage() {
  const [viewer, setViewer] = useState(null);
  const [activeFolderId, setActiveFolderId] = useState(null);

  const { data: folders = [], isLoading } = useQuery('ambience', () =>
    api.get('/ambience').then((r) => r.data),
    { staleTime: 60 * 1000 }
  );

  const visibleFolders = useMemo(
    () => folders.filter((f) => (f.stories?.length ?? 0) > 0 || folderCover(f)),
    [folders]
  );

  useEffect(() => {
    if (visibleFolders.length === 0) {
      setActiveFolderId(null);
      return;
    }
    const stillVisible = visibleFolders.some((f) => f.id === activeFolderId);
    if (!stillVisible) {
      setActiveFolderId(visibleFolders[0].id);
    }
  }, [visibleFolders, activeFolderId]);

  const activeFolder = useMemo(
    () => visibleFolders.find((f) => f.id === activeFolderId) ?? visibleFolders[0] ?? null,
    [visibleFolders, activeFolderId]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-cafe-50 to-white">
        <LoadingSpinner text="Chargement de l’ambiance…" />
      </div>
    );
  }

  const cover = activeFolder ? folderCover(activeFolder) : null;
  const stories = activeFolder?.stories ?? [];
  const hasStories = stories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cafe-50/80 via-white to-cafe-50/40">
      {/* En-tête */}
      <div className="relative overflow-hidden border-b border-cafe-200/60 bg-cafe-900 text-white">
        <span className="nd-orb nd-orb--a opacity-40" aria-hidden />
        <span className="nd-orb nd-orb--b opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l’accueil
          </Link>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            Galerie
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Ambiance</h1>
          <p className="mt-3 max-w-xl text-base text-white/75 md:text-lg">
            Moments, événements et souvenirs — choisissez un album ci-dessous.
          </p>
        </div>
      </div>

      {visibleFolders.length > 0 && (
        <nav
          className="sticky top-[4.25rem] z-40 border-b border-cafe-200/70 bg-white/95 backdrop-blur-md"
          aria-label="Albums"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="flex gap-2 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleFolders.map((folder) => {
                const thumb = folderCover(folder);
                const isActive = folder.id === activeFolder?.id;
                const count = folder.stories?.length ?? 0;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolderId(folder.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`inline-flex shrink-0 items-center gap-2.5 rounded-full border px-3 py-2 text-left transition ${
                      isActive
                        ? 'border-cafe-600 bg-cafe-700 text-white shadow-md shadow-cafe-900/15'
                        : 'border-cafe-200 bg-white text-cafe-800 hover:border-cafe-300 hover:bg-cafe-50'
                    }`}
                  >
                    <span
                      className={`rounded-full p-[2px] ${
                        isActive
                          ? 'bg-white/30'
                          : 'bg-gradient-to-tr from-cafe-400 via-cafe-600 to-cafe-800'
                      }`}
                    >
                      {thumb ? (
                        <img
                          src={mediaUrl(thumb)}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cafe-50">
                          <Sparkles className="h-4 w-4 text-cafe-400" />
                        </span>
                      )}
                    </span>
                    <span className="pr-1">
                      <span className="block max-w-[9rem] truncate text-sm font-semibold leading-tight sm:max-w-[11rem]">
                        {folder.name}
                      </span>
                      {count > 0 && (
                        <span
                          className={`block text-[11px] ${isActive ? 'text-white/75' : 'text-cafe-500'}`}
                        >
                          {mediaCountLabel(count)}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        {visibleFolders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cafe-200 bg-white px-6 py-16 text-center">
            <Image className="mx-auto mb-4 h-12 w-12 text-cafe-300" aria-hidden />
            <p className="font-medium text-cafe-800">Aucun album pour le moment</p>
            <p className="mt-2 text-sm text-cafe-600">Revenez bientôt pour découvrir nos photos et vidéos.</p>
          </div>
        ) : activeFolder ? (
          <section key={activeFolder.id}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-tr from-cafe-400 via-cafe-600 to-cafe-800 p-[2.5px] shadow-md">
                  <div className="overflow-hidden rounded-full bg-white p-[2px]">
                    {cover ? (
                      <img
                        src={mediaUrl(cover)}
                        alt=""
                        className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20"
                      />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cafe-50 md:h-20 md:w-20">
                        <Sparkles className="h-7 w-7 text-cafe-400" />
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-cafe-900 md:text-3xl">
                    {activeFolder.name}
                  </h2>
                  {hasStories && (
                    <p className="mt-1 text-sm text-cafe-600">{mediaCountLabel(stories.length)}</p>
                  )}
                </div>
              </div>

              {hasStories && (
                <button
                  type="button"
                  onClick={() => setViewer({ folder: activeFolder, startIndex: 0 })}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cafe-200 bg-white px-5 py-2.5 text-sm font-semibold text-cafe-800 shadow-sm transition hover:border-cafe-300 hover:bg-cafe-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Voir en stories
                </button>
              )}
            </div>

            {!hasStories ? (
              <p className="rounded-xl bg-cafe-50 px-4 py-6 text-sm text-cafe-600">
                Album en préparation — photos à venir.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {stories.map((story, storyIndex) => (
                  <li key={story.id}>
                    <button
                      type="button"
                      onClick={() => setViewer({ folder: activeFolder, startIndex: storyIndex })}
                      className="group nd-card-lift relative w-full overflow-hidden rounded-2xl border border-cafe-100 bg-white text-left shadow-sm ring-1 ring-cafe-50"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-cafe-100">
                        <AmbienceMediaThumb
                          story={story}
                          alt={story.caption || activeFolder.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                        />
                        {isVideoStory(story) && (
                          <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Vidéo
                          </span>
                        )}
                        <span className="nd-shine" aria-hidden />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cafe-900/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      </div>
                      {story.caption?.trim() && (
                        <p className="line-clamp-2 px-3 py-2.5 text-xs font-medium text-cafe-700 md:text-sm">
                          {story.caption}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>

      {viewer && (
        <AmbienceStoryViewer
          folder={viewer.folder}
          initialIndex={viewer.startIndex}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
