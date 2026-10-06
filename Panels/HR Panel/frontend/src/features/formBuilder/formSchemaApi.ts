import { auth } from "../../lib/firebase";

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    const forceRemote =
      import.meta.env.VITE_ADMIN_API_FORCE_REMOTE === "true";
    if (!forceRemote) {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

async function authHeaders(): Promise<Headers> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to load forms.");
  }
  const token = await user.getIdToken();
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function adminFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }

  return data;
}

export type ApiFormType = "guard" | "hr" | "site";

export interface ApiFormSchema {
  id: string;
  agencyId: string;
  formType: ApiFormType;
  fields: unknown[];
}

export async function fetchFormSchemaApi(
  formType: ApiFormType
): Promise<ApiFormSchema | null> {
  const data = await adminFetch<{ schema: ApiFormSchema | null }>(
    `/api/form-schemas/${formType}`
  );
  return data.schema;
}
