/** Base URL axios : /api en dev (proxy Vite), ou https://hôte/api si VITE_BACKEND_URL */
export function getApiBaseURL() {
  const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
  return base ? `${base}/api` : '/api';
}
