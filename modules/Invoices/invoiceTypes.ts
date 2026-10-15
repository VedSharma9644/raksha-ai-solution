export const SITE_INVOICES_COLLECTION = "siteInvoices";
export const AGENCY_INVOICE_SETTINGS_COLLECTION = "agencyInvoiceSettings";
export const INVOICE_COUNTERS_COLLECTION = "invoiceCounters";

export type InvoiceStatus = "draft" | "finalized" | "void";

export type InvoiceLineKind =
  | "base_male"
  | "base_female"
  | "base_other"
  | "custom";

export type InvoiceSignatureMode = "none" | "placeholder" | "external_key";

export type InvoicePeriod = {
  year: number;
  month: number;
  label: string;
  daysInMonth: number;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitRate: number;
  amount: number;
  kind: InvoiceLineKind;
  note?: string;
};

export type InvoiceBillFrom = {
  legalName: string;
  address: string;
  gstin: string;
  phone: string;
  email: string;
  logoUrl: string;
  footerText: string;
};

export type InvoiceBillTo = {
  name: string;
  address: string;
  city: string;
};

export type InvoiceSignature = {
  mode: InvoiceSignatureMode;
  label: string;
  signedAt?: string | null;
  providerRef?: string | null;
};

export type SiteInvoice = {
  id: string;
  agencyId: string;
  siteId: string;
  siteName: string;
  clientName: string;
  period: InvoicePeriod;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  billFrom: InvoiceBillFrom;
  billTo: InvoiceBillTo;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  notes: string;
  signature: InvoiceSignature;
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AgencyInvoiceSettings = {
  agencyId: string;
  legalName: string;
  address: string;
  gstin: string;
  phone: string;
  email: string;
  logoUrl: string;
  defaultTaxPercent: number;
  footerText: string;
  signatureLabel: string;
  updatedAt?: unknown;
};

export function roundMoney(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function lineAmount(quantity: number, unitRate: number): number {
  return roundMoney(Math.max(0, quantity) * Math.max(0, unitRate));
}

export function computeInvoiceTotals(
  lineItems: InvoiceLineItem[],
  taxPercent: number
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = roundMoney(
    lineItems.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)
  );
  const pct = Math.max(0, Number(taxPercent) || 0);
  const taxAmount = roundMoney((subtotal * pct) / 100);
  return {
    subtotal,
    taxAmount,
    total: roundMoney(subtotal + taxAmount),
  };
}

export function defaultAgencyInvoiceSettings(
  agencyId: string,
  seed?: Partial<AgencyInvoiceSettings>
): AgencyInvoiceSettings {
  return {
    agencyId,
    legalName: seed?.legalName?.trim() || "",
    address: seed?.address?.trim() || "",
    gstin: seed?.gstin?.trim() || "",
    phone: seed?.phone?.trim() || "",
    email: seed?.email?.trim() || "",
    logoUrl: seed?.logoUrl?.trim() || "",
    defaultTaxPercent:
      seed?.defaultTaxPercent != null && Number.isFinite(seed.defaultTaxPercent)
        ? Math.max(0, Number(seed.defaultTaxPercent))
        : 18,
    footerText:
      seed?.footerText?.trim() ||
      "Thank you for your business. Payment due as per agreed terms.",
    signatureLabel: seed?.signatureLabel?.trim() || "Authorized Signatory",
  };
}

export function periodLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1, 12)).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "long",
    year: "numeric",
  });
}

export function newLineId(): string {
  return `line_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
