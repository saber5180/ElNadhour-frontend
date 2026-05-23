import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { isVideoStory, storyMediaSrc } from '../utils/ambienceMedia';

const IMAGE_DURATION_MS = 5500;

/**
 * Lecteur plein écran type « stories » — photos et vidéos avec barre de progression.
 */
export default function AmbienceStoryViewer({ folder, initialIndex = 0, onClose }) {
  const stories = folder?.stories ?? [];
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const pausedRef = useRef(false);
  const videoRef = useRef(null);

  const current = stories[index];
  const hasStories = stories.length > 0;
  const isVideo = current ? isVideoStory(current) : false;

  const goNext = useCallback(() => {
    setProgress(0);
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [index, stories.length, onClose]);

  const goPrev = useCallback(() => {
    setProgress(0);
    if (index > 0) {
      setIndex((i) => i - 1);
    }
  }, [index]);

  useEffect(() => {
    setIndex(initialIndex);
    setProgress(0);
  }, [folder?.id, initialIndex]);

  // Progression automatique pour les images
  useEffect(() => {
    if (!hasStories || isVideo) return undefined;

    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / IMAGE_DURATION_MS) * 100);
      setProgress(pct);
      if (elapsed >= IMAGE_DURATION_MS) {
        clearInterval(interval);
        goNext();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [index, folder?.id, hasStories, isVideo, goNext]);

  // Lecture vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return undefined;

    setProgress(0);
    pausedRef.current = false;

    const play = async () => {
      try {
        video.currentTime = 0;
        await video.play();
      } catch {
        // Autoplay peut être bloqué sur certains navigateurs.
      }
    };

    play();

    const onTimeUpdate = () => {
      if (pausedRef.current || !video.duration) return;
      setProgress(Math.min(100, (video.currentTime / video.duration) * 100));
    };

    const onEnded = () => goNext();

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.pause();
    };
  }, [index, folder?.id, isVideo, goNext]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  const setPaused = (paused) => {
    pausedRef.current = paused;
    const video = videoRef.current;
    if (video && isVideo) {
      if (paused) video.pause();
      else video.play().catch(() => {});
    }
  };

  if (!folder || !hasStories) return null;

  const mediaSrc = storyMediaSrc(current);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Ambiance — ${folder.name}`}
    >
      <div className="relative flex h-full w-full max-w-lg flex-col md:max-h-[92vh] md:overflow-hidden md:rounded-2xl md:shadow-2xl">
        <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 px-3 pt-3 md:pt-4">
          {stories.map((s, i) => (
            <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-75 ease-linear"
                style={{
                  width: i < index ? '100%' : i === index ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-3 pt-6 md:px-4 md:pt-8">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-bold text-white drop-shadow-md">{folder.name}</span>
            <span className="text-xs text-white/60">
              {index + 1}/{stories.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex flex-1 items-center justify-center bg-black">
          {isVideo ? (
            <video
              key={current.id}
              ref={videoRef}
              src={mediaSrc}
              className="max-h-full max-w-full object-contain"
              playsInline
              muted
            />
          ) : (
            <img
              key={current.id}
              src={mediaSrc}
              alt={current.caption || folder.name}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          )}

          <button
            type="button"
            className="absolute inset-y-0 left-0 w-1/3 cursor-pointer"
            aria-label="Précédent"
            onClick={goPrev}
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 w-1/3 cursor-pointer"
            aria-label="Suivant"
            onClick={goNext}
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          />

          {index > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 hidden rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60 md:flex"
              aria-label="Média précédent"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {index < stories.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 hidden rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60 md:flex"
              aria-label="Média suivant"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {current.caption?.trim() && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-8 pt-16 md:pb-10">
            <p className="text-center text-sm leading-relaxed text-white/95 md:text-base">
              {current.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
