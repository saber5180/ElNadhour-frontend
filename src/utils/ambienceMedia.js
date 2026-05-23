import { mediaUrl } from './mediaUrl';

export function isVideoStory(story) {
  return story?.media_type === 'video';
}

export function storyMediaSrc(story) {
  return mediaUrl(story?.image_url);
}

/** Compte photos + vidéos pour l’affichage */
export function mediaCountLabel(count) {
  if (count === 0) return '';
  return `${count} média${count !== 1 ? 's' : ''}`;
}
