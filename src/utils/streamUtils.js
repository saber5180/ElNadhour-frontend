// Utility functions for stream URL handling

function currentHostname() {
  if (typeof window === 'undefined' || !window.location?.hostname) return '';
  return window.location.hostname;
}

/** Paramètres embed YouTube : pas de mute=1 (sinon aucun son). playsinline = mobile. */
const YOUTUBE_EMBED_QUERY = 'autoplay=1&mute=0&rel=0&playsinline=1';

/** Twitch exige que `parent` = domaine de la page qui affiche l’iframe (spectateur), pas celui de l’admin. */
function twitchEmbedForChannel(channel) {
  const host = currentHostname();
  if (!channel || !host) return null;
  return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(host)}&autoplay=true&muted=false`;
}

/**
 * URL lisible par l’iframe du lecteur (spectateur).
 * Toujours l’appeler côté client avec le hostname actuel (surtout pour Twitch).
 */
export const convertToEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  const trimmedUrl = url.trim();

  // Déjà un player Twitch : recalculer le parent pour CE domaine (corrige écran noir cross-domain)
  if (trimmedUrl.includes('player.twitch.tv')) {
    try {
      const u = new URL(trimmedUrl);
      const channel = u.searchParams.get('channel');
      if (channel) {
        const rebuilt = twitchEmbedForChannel(channel);
        if (rebuilt) return rebuilt;
      }
    } catch (_) {
      /* ignore */
    }
  }

  // YouTube déjà en /embed/ (souvent sauvé depuis l’admin avec mute=1) : réécrire pour activer le son
  if (trimmedUrl.includes('youtube.com/embed/')) {
    try {
      const u = new URL(trimmedUrl);
      const id = u.pathname.match(/\/embed\/([^/?]+)/)?.[1];
      if (id) {
        const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '');
        if (cleanId) {
          return `https://www.youtube.com/embed/${cleanId}?${YOUTUBE_EMBED_QUERY}`;
        }
      }
    } catch (_) {
      /* ignore */
    }
  }

  // YouTube : /watch, youtu.be, /live/, /embed/
  if (trimmedUrl.includes('youtube.com/live/')) {
    const videoId = trimmedUrl
      .split('youtube.com/live/')[1]
      ?.split('?')[0]
      ?.split('/')[0]
      ?.replace(/[^a-zA-Z0-9_-]/g, '');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?${YOUTUBE_EMBED_QUERY}`;
    }
  }

  if (trimmedUrl.includes('youtube.com/watch') || trimmedUrl.includes('youtu.be/')) {
    let videoId = null;

    if (trimmedUrl.includes('youtube.com/watch?v=')) {
      videoId = trimmedUrl.split('v=')[1]?.split('&')[0];
    } else if (trimmedUrl.includes('youtu.be/')) {
      videoId = trimmedUrl.split('youtu.be/')[1]?.split('?')[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?${YOUTUBE_EMBED_QUERY}`;
    }
  }

  if (trimmedUrl.includes('facebook.com')) {
    return trimmedUrl;
  }

  // Chaîne Twitch (URL classique)
  if (trimmedUrl.includes('twitch.tv/') && !trimmedUrl.includes('player.twitch.tv')) {
    const channel = trimmedUrl.split('twitch.tv/')[1]?.split('?')[0]?.split('/')[0];
    if (channel && !['videos', 'settings', 'downloads'].includes(channel.toLowerCase())) {
      const embed = twitchEmbedForChannel(channel);
      if (embed) return embed;
    }
  }

  if (trimmedUrl.includes('instagram.com')) {
    return trimmedUrl;
  }

  if (trimmedUrl.includes('tiktok.com')) {
    return trimmedUrl;
  }

  return trimmedUrl;
};

/** URL à passer à l’iframe sur la page live (hors caméra locale / liens FB/IG). */
export function getLiveIframeSrc(storedUrl) {
  if (!storedUrl || typeof storedUrl !== 'string') return '';
  const u = storedUrl.trim();
  if (u === 'camera-live') return '';
  if (isExternalOnlyLiveUrl(u)) return '';
  return convertToEmbedUrl(u);
}

export const isEmbeddableUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  const embedPatterns = [
    /youtube\.com\/embed/,
    /player\.twitch\.tv/,
    /vimeo\.com\/video/,
    /dailymotion\.com\/embed/,
  ];

  return embedPatterns.some((pattern) => pattern.test(url));
};

export const getStreamPlatform = (url) => {
  if (!url || typeof url !== 'string') return 'unknown';

  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('facebook.com') || url.includes('fb.com') || url.includes('fb.watch')) return 'facebook';
  if (url.includes('twitch.tv')) return 'twitch';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url === 'camera-live') return 'camera';

  return 'custom';
};

/** Facebook / Instagram live: open in their app or browser — no in-app player */
export const isExternalOnlyLiveUrl = (url) => {
  if (!url || typeof url !== 'string' || url === 'camera-live') return false;
  const p = getStreamPlatform(url);
  return p === 'facebook' || p === 'instagram';
};

export const validateStreamUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  try {
    new URL(trimmedUrl);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  const platform = getStreamPlatform(trimmedUrl);

  if (platform === 'facebook') {
    return {
      isValid: true,
      platform: 'facebook',
      warning: 'Les visiteurs seront envoyés directement sur Facebook (aucune page intermédiaire).',
      requiresWorkaround: true,
    };
  }

  if (platform === 'instagram') {
    return {
      isValid: true,
      platform: 'instagram',
      warning: 'Le live s’ouvrira directement dans Instagram (pas de page sur ce site).',
      requiresWorkaround: true,
    };
  }

  if (platform === 'tiktok') {
    return {
      isValid: false,
      error: 'TikTok live streams are not embeddable. Use YouTube Live or Twitch instead.',
    };
  }

  const supportedPlatforms = ['youtube', 'twitch', 'custom'];

  if (!supportedPlatforms.includes(platform)) {
    return {
      isValid: false,
      error: `${platform.charAt(0).toUpperCase() + platform.slice(1)} streams may not be embeddable. Try YouTube or Twitch for guaranteed compatibility.`,
    };
  }

  if (platform === 'youtube') {
    const ok =
      trimmedUrl.includes('watch?v=') ||
      trimmedUrl.includes('youtu.be/') ||
      trimmedUrl.includes('/embed/') ||
      trimmedUrl.includes('youtube.com/live/');
    if (!ok) {
      return {
        isValid: false,
        error:
          'Utilisez une URL YouTube valide (watch, youtu.be, /live/ ou /embed/).',
      };
    }
  }

  if (platform === 'twitch') {
    if (!trimmedUrl.includes('twitch.tv/') || trimmedUrl.includes('/clip/')) {
      return {
        isValid: false,
        error: 'Utilisez l’URL de la chaîne (twitch.tv/nom), pas un clip.',
      };
    }
  }

  return { isValid: true, platform };
};
