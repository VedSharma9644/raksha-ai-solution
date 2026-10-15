/**
 * Single Admin API client for Admin Panel, HR Panel, and @raskha/web-ops.
 * Both panels call the Admin backend (:3001).
 *
 * Call `configureAdminApi({ getIdToken })` once at app boot (e.g. from firebase.ts).
 */

export type GetIdToken = () => Promise<string | null>;

let boundGetIdToken: GetIdToken | null = null;

/** Bind the Firebase (or other) ID-token getter used by adminFetch. */
export function configureAdminApi(options: { getIdToken: GetIdToken }): void {
  boundGetIdToken = options.getIdToken;
}

function resolveGetIdToken(override?: GetIdToken): GetIdToken {
  if (override) return override;
  if (boundGetIdToken) return boundGetIdToken;
  return async () => null;
}

export function resolveAdminApiBase(): string {
  const fromEnv = (
    import.meta.env.VITE_ADMIN_API_URL as string | undefined
  )?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    if (import.meta.env.VITE_ADMIN_API_FORCE_REMOTE !== "true") {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

export type AdminAuthHeaderOptions = {
  /** Override the bound token getter for this call. */
  getIdToken?: GetIdToken;
  /** When true (default), throw if no token. */
  requireAuth?: boolean;
  errorMessage?: string;
  /** When true (default), set Content-Type: application/json. */
  json?: boolean;
};

export async function adminAuthHeaders(
  options?: AdminAuthHeaderOptions
): Promise<Headers> {
  const {
    getIdToken: getIdTokenOverride,
    requireAuth = true,
    errorMessage = "You must be signed in to continue.",
    json = true,
  } = options ?? {};

  const headers = new Headers();
  if (json) {
    headers.set("Content-Type", "application/json");
  }

  const token = await resolveGetIdToken(getIdTokenOverride)();
  if (!token) {
    if (requireAuth) {
      throw new Error(errorMessage);
    }
    return headers;
  }
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export type AdminFetchOptions = RequestInit &
  AdminAuthHeaderOptions & {
    /** When false, return raw Response instead of parsing JSON. */
    parseJson?: boolean;
  };

/**
 * Authenticated fetch against the Admin API.
 * `path` should start with `/api/...`.
 */
export async function adminFetch<T>(
  path: string,
  init?: AdminFetchOptions
): Promise<T> {
  const {
    getIdToken: getIdTokenOverride,
    requireAuth,
    errorMessage,
    json,
    parseJson = true,
    headers: initHeaders,
    ...fetchInit
  } = init ?? {};

  const headers = await adminAuthHeaders({
    getIdToken: getIdTokenOverride,
    requireAuth,
    errorMessage,
    json,
  });

  if (initHeaders) {
    const extra = new Headers(initHeaders);
    extra.forEach((value, key) => headers.set(key, value));
  }

  const base = resolveAdminApiBase();
  const response = await fetch(`${base}${path}`, {
    ...fetchInit,
    headers,
  });

  if (!parseJson) {
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(data.error ?? `Request failed (${response.status})`);
    }
    return response as unknown as T;
  }

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(
      (data as { error?: string }).error ?? `Request failed (${response.status})`
    );
  }
  return data;
}

/** Authenticated fetch that returns a Blob (e.g. CSV / PDF download). */
export async function adminFetchBlob(
  path: string,
  init?: Omit<AdminFetchOptions, "parseJson" | "json">
): Promise<Blob> {
  const response = await adminFetch<Response>(path, {
    ...init,
    json: false,
    parseJson: false,
  });
  return response.blob();
}
