export function getApiBaseUrl() {
  // For local dev, this matches the existing backend default.
  // In prod/preview, set NEXT_PUBLIC_API_BASE_URL (e.g. https://api.example.com).
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
}

export function apiUrl(pathname: string) {
  const base = getApiBaseUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

