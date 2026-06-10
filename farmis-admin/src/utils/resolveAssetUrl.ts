const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export function resolveAssetUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  const origin = API_BASE.replace(/\/api\/?$/, '');
  return `${origin}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}
