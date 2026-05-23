import React from 'react';
import { Play } from 'lucide-react';
import { isVideoStory, storyMediaSrc } from '../utils/ambienceMedia';

/**
 * Aperçu photo ou vidéo (première frame) pour grilles et couvertures.
 */
export default function AmbienceMediaThumb({
  story,
  src,
  alt = '',
  className = 'h-full w-full object-cover',
  showPlayBadge = true,
}) {
  const url = src || (story ? storyMediaSrc(story) : '');
  const isVideo = story ? isVideoStory(story) : false;

  if (!url) return null;

  return (
    <div className="relative h-full w-full">
      {isVideo ? (
        <video
          src={url}
          className={className}
          muted
          playsInline
          preload="metadata"
          aria-hidden={!alt}
        />
      ) : (
        <img src={url} alt={alt} className={className} loading="lazy" />
      )}
      {isVideo && showPlayBadge && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-cafe-900 shadow-md">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </span>
      )}
    </div>
  );
}
