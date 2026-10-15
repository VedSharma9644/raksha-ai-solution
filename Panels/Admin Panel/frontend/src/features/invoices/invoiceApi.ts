import type {
  AgencyInvoiceSettings,
  InvoiceLineItem,
  InvoiceStatus,
  SiteInvoice,
} from "@raskha/invoices";
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

async function authHeaders(json = true): Promise<Headers> {
  const headers = new Headers();
  if (json) headers.set("Content-Type", "application/json");
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to manage invoices.");
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

export async function fetchInvoiceSettingsApi(): Promise<AgencyInvoiceSettings> {
  const data = await adminFetch<{ settings: AgencyInvoiceSettings }>(
    "/api/invoices/settings"
  );
  return data.settings;
}

export async function saveInvoiceSettingsApi(
  settings: AgencyInvoiceSettings
): Promise<AgencyInvoiceSettings> {
  const data = await adminFetch<{ settings: AgencyInvoiceSettings }>(
    "/api/invoices/settings",
    {
      method: "PUT",
      body: JSON.stringify({ settings }),
    }
  );
  return data.settings;
}

export async function listInvoicesApi(params?: {
  year?: number;
  month?: number;
  siteId?: string;
}): Promise<SiteInvoice[]> {
  const qs = new URLSearchParams();
  if (params?.year != null) qs.set("year", String(params.year));
  if (params?.month != null) qs.set("month", String(params.month));
  if (params?.siteId) qs.set("siteId", params.siteId);
  const q = qs.toString();
  const data = await adminFetch<{ invoices: SiteInvoice[] }>(
    `/api/invoices${q ? `?${q}` : ""}`
  );
  return data.invoices ?? [];
}

export async function createInvoiceDraftApi(params: {
  siteId: string;
  year: number;
  month: number;
}): Promise<SiteInvoice> {
  const data = await adminFetch<{ invoice: SiteInvoice }>("/api/invoices/draft", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return data.invoice;
}

export async function fetchInvoiceApi(invoiceId: string): Promise<SiteInvoice> {
  const data = await adminFetch<{ invoice: SiteInvoice }>(
    `/api/invoices/${encodeURIComponent(invoiceId)}`
  );
  return data.invoice;
}

export async function updateInvoiceApi(
  invoiceId: string,
  patch: {
    status?: InvoiceStatus;
    issueDate?: string;
    dueDate?: string;
    billFrom?: Partial<SiteInvoice["billFrom"]>;
    billTo?: Partial<SiteInvoice["billTo"]>;
    lineItems?: InvoiceLineItem[];
    taxPercent?: number;
    notes?: string;
    signature?: Partial<SiteInvoice["signature"]>;
  }
): Promise<SiteInvoice> {
  const data = await adminFetch<{ invoice: SiteInvoice }>(
    `/api/invoices/${encodeURIComponent(invoiceId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    }
  );
  return data.invoice;
}

export async function deleteInvoiceDraftApi(invoiceId: string): Promise<void> {
  const headers = await authHeaders(false);
  const response = await fetch(
    `${API_BASE}/api/invoices/${encodeURIComponent(invoiceId)}`,
    { method: "DELETE", headers }
  );
  if (response.status === 204) return;
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
}

export async function downloadInvoicePdfApi(invoiceId: string): Promise<void> {
  const headers = await authHeaders(false);
  const response = await fetch(
    `${API_BASE}/api/invoices/${encodeURIComponent(invoiceId)}/pdf`,
    { headers }
  );
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error ?? `PDF download failed (${response.status})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
