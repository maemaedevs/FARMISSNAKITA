import { getApiBaseUrl } from "@/lib/apiConfig";

/** Turns a backend-relative upload path into a full URL for Image components. */
export function resolveAssetUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
