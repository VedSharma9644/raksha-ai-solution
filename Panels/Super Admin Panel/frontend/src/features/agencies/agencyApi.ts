import type { AgencyFormValues, AgencyListItem } from "./agencyTypes";
import { saFetch } from "../../lib/saApi";

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
