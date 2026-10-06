/**
 * Super Admin API client.
 * Prefer VITE_SUPER_ADMIN_API_URL; in local Vite dev, default to localhost:3003
 * so a leftover Cloud Run env var does not break new local-only routes.
 */

function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_SUPER_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    // Local panel development should hit the local SA backend unless explicitly
    // forced with VITE_SUPER_ADMIN_API_FORCE_REMOTE=true.
    const forceRemote = import.meta.env.VITE_SUPER_ADMIN_API_FORCE_REMOTE === "true";
    if (!forceRemote) {
      return "http://localhost:3003";
    }
  }
  return fromEnv || "http://localhost:3003";
}

const API_BASE = resolveApiBase();

function apiKey(): string {
  return import.meta.env.VITE_SUPER_ADMIN_API_KEY ?? "";
}

export async function saFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const key = apiKey();
  if (key) headers.set("x-api-key", key);

  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...init,
    headers,
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    const detail = data.error || `Request failed (${response.status})`;
    throw new Error(
      response.status === 404
        ? `${detail} — ${init.method ?? "GET"} ${url}`
        : detail
    );
  }

  return data;
}

export { API_BASE as SUPER_ADMIN_API_BASE };
