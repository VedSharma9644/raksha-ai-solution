import type { AgencyFormValues, AgencyListItem } from "./agencyTypes";

const API_BASE =
  import.meta.env.VITE_SUPER_ADMIN_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3003";

function apiKey(): string {
  return import.meta.env.VITE_SUPER_ADMIN_API_KEY ?? "";
}

async function saFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const key = apiKey();
  if (key) headers.set("x-api-key", key);

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

export async function listAgenciesApi(): Promise<AgencyListItem[]> {
  const data = await saFetch<{ agencies: AgencyListItem[] }>("/api/agencies");
  return data.agencies;
}

export async function getAgencyApi(id: string): Promise<AgencyListItem> {
  const data = await saFetch<{ agency: AgencyListItem }>(`/api/agencies/${id}`);
  return data.agency;
}

export async function createAgencyApi(
  values: AgencyFormValues & { password: string }
): Promise<AgencyListItem> {
  const data = await saFetch<{ agency: AgencyListItem }>("/api/agencies", {
    method: "POST",
    body: JSON.stringify(values),
  });
  return data.agency;
}

export async function updateAgencyApi(
  id: string,
  values: Partial<AgencyFormValues> & {
    password?: string;
    status?: "active" | "inactive";
  }
): Promise<AgencyListItem> {
  const data = await saFetch<{ agency: AgencyListItem }>(
    `/api/agencies/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(values),
    }
  );
  return data.agency;
}

export async function requestAgencyDeleteOtpApi(id: string): Promise<{
  notified: string;
  debugOtp?: string;
  expiresInSeconds: number;
}> {
  return saFetch(`/api/agencies/${id}/delete-request`, { method: "POST" });
}

export async function confirmAgencyDeleteApi(
  id: string,
  otp: string
): Promise<void> {
  await saFetch(`/api/agencies/${id}/delete-confirm`, {
    method: "POST",
    body: JSON.stringify({ otp }),
  });
}
