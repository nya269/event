// Derive the backend base URL from VITE_API_URL (e.g. http://localhost:4000/api → http://localhost:4000)
const API_URL = import.meta.env.VITE_API_URL || '';
const BACKEND_BASE = API_URL.replace(/\/api\/?$/, '');

/**
 * Convert a relative /uploads/... path to a full backend URL.
 * If the path is already absolute (http/https), return it as-is.
 */
export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_BASE}${path}`;
}
