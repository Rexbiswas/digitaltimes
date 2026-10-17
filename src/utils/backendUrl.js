/**
 * Normalizes the backend API URL across environments (Vercel serverless, preview, local)
 * Ensures that '/api' is consistently present without double trailing slashes.
 */
export function getBackendApiUrl() {
  const raw = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api"
  )
    .trim()
    .replace(/\/+$/, "");

  return raw.endsWith("/api") ? raw : `${raw}/api`;
}
