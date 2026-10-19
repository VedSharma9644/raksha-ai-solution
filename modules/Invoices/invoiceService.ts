import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  computeSiteClientRevenueMonthly,
  sumShiftGenderRequirements,
} from "@raskha/site-management";

import { getAgencyInvoiceSettings } from "./invoiceSettings";
import {
  INVOICE_COUNTERS_COLLECTION,
  SITE_INVOICES_COLLECTION,
  computeInvoiceTotals,
  lineAmount,
  newLineId,
  periodLabel,
  roundMoney,
  type InvoiceLineItem,
  type InvoiceStatus,
  type SiteInvoice,
} from "./invoiceTypes";

type SiteDoc = {
  id: string;
  agencyId?: string;
  siteName?: string;
  clientName?: string;
  address?: string;
  city?: string;
  status?: string;
  clientRateMaleMonthly?: number;
  clientRateFemaleMonthly?: number;
  shiftConfig?: {
    has24hSurveillance?: boolean;
    shifts?: Array<{
      requiredGuards?: number;
      genderRequirements?: {
        male?: number;
        female?: number;
        other?: number;
      } | null;
    }>;
  } | null;
};

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function normalizeLine(raw: Partial<InvoiceLineItem>): InvoiceLineItem {
  const quantity = Math.max(0, Number(raw.quantity) || 0);
  const unitRate = Math.max(0, Number(raw.unitRate) || 0);
  const kind = raw.kind ?? "custom";
  return {
    id: String(raw.id ?? newLineId()),
    description: String(raw.description ?? "").trim() || "Line item",
    quantity,
    unitRate,
    amount: lineAmount(quantity, unitRate),
    kind:
      kind === "base_male" ||
      kind === "base_female" ||
      kind === "base_other" ||
      kind === "custom"
        ? kind
        : "custom",
    note: String(raw.note ?? "").trim() || undefined,
  };
}

async function nextInvoiceNumber(
  agencyId: string,
  year: number
): Promise<string> {
  const counterId = `${agencyId}_${year}`;
  const ref = getFirestore()
    .collection(INVOICE_COUNTERS_COLLECTION)
    .doc(counterId);

  const seq = await getFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists
      ? Number((snap.data() as { seq?: number }).seq) || 0
      : 0;
    const next = current + 1;
    tx.set(
      ref,
      {
        agencyId,
        year,
        seq: next,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return next;
  });

  return `INV-${year}-${String(seq).padStart(4, "0")}`;
}

function mapInvoice(id: string, data: Record<string, unknown>): SiteInvoice {
  return { id, ...(data as Omit<SiteInvoice, "id">) };
}

export async function listSiteInvoices(params: {
  agencyId: string;
  year?: number;
  month?: number;
  siteId?: string;
  /** When set, only invoices for sites in this branch + unassigned sites. */
  branchId?: string | null;
}): Promise<SiteInvoice[]> {
  const db = getFirestore();
  const snap = await db
    .collection(SITE_INVOICES_COLLECTION)
    .where("agencyId", "==", params.agencyId)
    .get();

  let rows = snap.docs.map((d) =>
    mapInvoice(d.id, (d.data() ?? {}) as Record<string, unknown>)
  );
  if (params.year != null) {
    rows = rows.filter((r) => r.period?.year === params.year);
  }
  if (params.month != null) {
    rows = rows.filter((r) => r.period?.month === params.month);
  }
  if (params.siteId) {
    rows = rows.filter((r) => r.siteId === params.siteId);
  }
  if (params.branchId) {
    const sitesSnap = await db
      .collection("sites")
      .where("agencyId", "==", params.agencyId)
      .get();
    const allowedSiteIds = new Set(
      sitesSnap.docs
        .filter((d) => {
          const data = d.data() as { branchId?: string | null };
          const value =
            data.branchId == null ? "" : String(data.branchId).trim();
          return value === "" || value === params.branchId;
        })
        .map((d) => d.id)
    );
    rows = rows.filter((r) => allowedSiteIds.has(r.siteId));
  }
  rows.sort((a, b) => {
    if (a.period.year !== b.period.year) return b.period.year - a.period.year;
    if (a.period.month !== b.period.month) return b.period.month - a.period.month;
    return (b.invoiceNumber || "").localeCompare(a.invoiceNumber || "");
  });
  return rows;
}

export async function getSiteInvoice(params: {
  agencyId: string;
  invoiceId: string;
}): Promise<SiteInvoice> {
  const snap = await getFirestore()
    .collection(SITE_INVOICES_COLLECTION)
    .doc(params.invoiceId)
    .get();
  if (!snap.exists) {
    throw httpError("Invoice not found.", 404);
  }
  const invoice = mapInvoice(
    snap.id,
    (snap.data() ?? {}) as Record<string, unknown>
  );
  if (invoice.agencyId !== params.agencyId) {
    throw httpError("Invoice not found.", 404);
  }
  return invoice;
}

export async function createSiteInvoiceDraft(params: {
  agencyId: string;
  siteId: string;
  year: number;
  month: number;
  createdByUid: string;
}): Promise<SiteInvoice> {
  const { agencyId, siteId, year, month, createdByUid } = params;
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw httpError("Provide a valid year and month.", 400);
  }

  const db = getFirestore();
  const siteSnap = await db.collection("sites").doc(siteId).get();
  if (!siteSnap.exists) {
    throw httpError("Site not found.", 404);
  }
  const site = { id: siteSnap.id, ...siteSnap.data() } as SiteDoc;
  if (site.agencyId !== agencyId) {
    throw httpError("Site not found.", 404);
  }

  // Bill from site contract (shift requirements × rates), not live assignments.
  // Guard assignment is operational (HR/site manager) and must not block invoicing.
  const required = sumShiftGenderRequirements(
    site.shiftConfig?.shifts ?? []
  );
  const male = required.male;
  const female = required.female;
  const other = required.other;

  const maleRate = roundMoney(Number(site.clientRateMaleMonthly) || 0);
  const femaleRate = roundMoney(Number(site.clientRateFemaleMonthly) || 0);
  const settings = await getAgencyInvoiceSettings(agencyId);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lineItems: InvoiceLineItem[] = [];

  if (male > 0 || maleRate > 0) {
    lineItems.push(
      normalizeLine({
        description: `Male guards — ${periodLabel(year, month)}`,
        quantity: male,
        unitRate: maleRate,
        kind: "base_male",
        note:
          male === 0
            ? "No male headcount on site shifts — edit quantity if needed"
            : "From site shift requirements",
      })
    );
  }
  if (female > 0 || femaleRate > 0) {
    lineItems.push(
      normalizeLine({
        description: `Female guards — ${periodLabel(year, month)}`,
        quantity: female,
        unitRate: femaleRate,
        kind: "base_female",
        note:
          female === 0
            ? "No female headcount on site shifts — edit quantity if needed"
            : "From site shift requirements",
      })
    );
  }
  if (other > 0) {
    lineItems.push(
      normalizeLine({
        description: `Other guards — ${periodLabel(year, month)}`,
        quantity: other,
        unitRate: maleRate,
        kind: "base_other",
        note: "From site shift requirements",
      })
    );
  }

  if (lineItems.length === 0) {
    lineItems.push(
      normalizeLine({
        description: `Site security services — ${periodLabel(year, month)}`,
        quantity: 0,
        unitRate: 0,
        kind: "custom",
        note: "No shift headcount or client rates on site — edit lines as needed",
      })
    );
  }

  void computeSiteClientRevenueMonthly({
    maleRate,
    femaleRate,
    maleCount: male,
    femaleCount: female,
    otherCount: other,
  });

  const taxPercent = settings.defaultTaxPercent;
  const totals = computeInvoiceTotals(lineItems, taxPercent);
  const invoiceNumber = await nextInvoiceNumber(agencyId, year);
  const ref = db.collection(SITE_INVOICES_COLLECTION).doc();

  const invoice: SiteInvoice = {
    id: ref.id,
    agencyId,
    siteId,
    siteName: site.siteName?.trim() || "Site",
    clientName: site.clientName?.trim() || "",
    period: {
      year,
      month,
      label: periodLabel(year, month),
      daysInMonth,
    },
    invoiceNumber,
    status: "draft",
    issueDate: todayKey(),
    dueDate: "",
    billFrom: {
      legalName: settings.legalName || "Security Agency",
      address: settings.address,
      gstin: settings.gstin,
      phone: settings.phone,
      email: settings.email,
      logoUrl: settings.logoUrl,
      footerText: settings.footerText,
    },
    billTo: {
      name: site.clientName?.trim() || site.siteName?.trim() || "Client",
      address: site.address?.trim() || "",
      city: site.city?.trim() || "",
    },
    lineItems,
    subtotal: totals.subtotal,
    taxPercent,
    taxAmount: totals.taxAmount,
    total: totals.total,
    notes: `Billing period: ${periodLabel(year, month)} (${daysInMonth} calendar days). Base lines use site shift headcount × full-month client rates (not live guard assignments).`,
    signature: {
      mode: "placeholder",
      label: settings.signatureLabel || "Authorized Signatory",
      signedAt: null,
      providerRef: null,
    },
    createdByUid,
  };

  await ref.set({
    ...invoice,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return invoice;
}

export async function updateSiteInvoice(params: {
  agencyId: string;
  invoiceId: string;
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
  };
}): Promise<SiteInvoice> {
  const existing = await getSiteInvoice({
    agencyId: params.agencyId,
    invoiceId: params.invoiceId,
  });

  const wantsStatus = params.patch.status;
  if (existing.status === "void" && wantsStatus !== "draft") {
    throw httpError("Void invoices cannot be edited.", 400);
  }
  if (
    existing.status === "finalized" &&
    wantsStatus !== "draft" &&
    wantsStatus !== "void"
  ) {
    // Allow edits only when unlocking back to draft or voiding
    const editingContent =
      params.patch.lineItems != null ||
      params.patch.taxPercent != null ||
      params.patch.notes != null ||
      params.patch.billFrom != null ||
      params.patch.billTo != null ||
      params.patch.dueDate != null ||
      params.patch.issueDate != null;
    if (editingContent && wantsStatus !== "draft") {
      throw httpError(
        "Finalized invoices are locked. Set status back to draft to edit.",
        400
      );
    }
  }

  const lineItems = (params.patch.lineItems ?? existing.lineItems).map((l) =>
    normalizeLine(l)
  );
  const taxPercent =
    params.patch.taxPercent != null
      ? Math.max(0, Number(params.patch.taxPercent) || 0)
      : existing.taxPercent;
  const totals = computeInvoiceTotals(lineItems, taxPercent);

  const nextStatus: InvoiceStatus =
    wantsStatus === "draft" ||
    wantsStatus === "finalized" ||
    wantsStatus === "void"
      ? wantsStatus
      : existing.status;

  const updated: SiteInvoice = {
    ...existing,
    status: nextStatus,
    issueDate:
      params.patch.issueDate != null
        ? String(params.patch.issueDate)
        : existing.issueDate,
    dueDate:
      params.patch.dueDate != null
        ? String(params.patch.dueDate)
        : existing.dueDate,
    billFrom: { ...existing.billFrom, ...(params.patch.billFrom ?? {}) },
    billTo: { ...existing.billTo, ...(params.patch.billTo ?? {}) },
    lineItems,
    taxPercent,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,
    notes:
      params.patch.notes != null
        ? String(params.patch.notes)
        : existing.notes,
    signature: {
      ...existing.signature,
      ...(params.patch.signature ?? {}),
    },
  };

  await getFirestore()
    .collection(SITE_INVOICES_COLLECTION)
    .doc(params.invoiceId)
    .set(
      {
        ...updated,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return updated;
}

/** Permanently delete a draft invoice. Finalized/void invoices cannot be deleted. */
export async function deleteSiteInvoiceDraft(params: {
  agencyId: string;
  invoiceId: string;
}): Promise<void> {
  const existing = await getSiteInvoice({
    agencyId: params.agencyId,
    invoiceId: params.invoiceId,
  });
  if (existing.status !== "draft") {
    throw httpError(
      "Only draft invoices can be deleted. Unlock or void finalized invoices instead.",
      400
    );
  }
  await getFirestore()
    .collection(SITE_INVOICES_COLLECTION)
    .doc(params.invoiceId)
    .delete();
}
