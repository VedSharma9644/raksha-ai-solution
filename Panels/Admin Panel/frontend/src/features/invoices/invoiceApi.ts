import type {
  AgencyInvoiceSettings,
  InvoiceLineItem,
  InvoiceStatus,
  SiteInvoice,
} from "@raskha/invoices";
import { adminFetch, adminFetchBlob } from "@raskha/shared";

export async function fetchInvoiceSettingsApi(): Promise<AgencyInvoiceSettings> {
  const data = await adminFetch<{ settings: AgencyInvoiceSettings }>(
    "/api/invoices/settings",
    { errorMessage: "You must be signed in to manage invoices." }
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
      errorMessage: "You must be signed in to manage invoices.",
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
    `/api/invoices${q ? `?${q}` : ""}`,
    { errorMessage: "You must be signed in to manage invoices." }
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
    errorMessage: "You must be signed in to manage invoices.",
  });
  return data.invoice;
}

export async function fetchInvoiceApi(invoiceId: string): Promise<SiteInvoice> {
  const data = await adminFetch<{ invoice: SiteInvoice }>(
    `/api/invoices/${encodeURIComponent(invoiceId)}`,
    { errorMessage: "You must be signed in to manage invoices." }
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
      errorMessage: "You must be signed in to manage invoices.",
    }
  );
  return data.invoice;
}

export async function deleteInvoiceDraftApi(invoiceId: string): Promise<void> {
  const response = await adminFetch<Response>(
    `/api/invoices/${encodeURIComponent(invoiceId)}`,
    {
      method: "DELETE",
      json: false,
      parseJson: false,
      errorMessage: "You must be signed in to manage invoices.",
    }
  );
  if (response.status === 204) return;
}

export async function downloadInvoicePdfApi(invoiceId: string): Promise<void> {
  const blob = await adminFetchBlob(
    `/api/invoices/${encodeURIComponent(invoiceId)}/pdf`,
    { errorMessage: "You must be signed in to manage invoices." }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
