/**
 * Préfixe les chemins relatifs (/uploads/...) avec l’API en prod (Vercel → Render).
 * Définir VITE_BACKEND_URL (sans /api), ex. https://elnadhour-api.onrender.com
 */
export function mediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
  if (url.startsWith('/') && base) return `${base}${url}`;
  return url;
}
