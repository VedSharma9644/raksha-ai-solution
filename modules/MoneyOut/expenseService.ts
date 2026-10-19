import { FieldValue, getFirestore } from "firebase-admin/firestore";

import {
  AGENCY_EXPENSES_COLLECTION,
  roundMoney,
  type AgencyExpense,
  type ExpenseCategory,
} from "./moneyOutTypes";

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function mapExpense(id: string, data: Record<string, unknown>): AgencyExpense {
  return {
    id,
    agencyId: String(data.agencyId ?? ""),
    date: String(data.date ?? ""),
    amount: roundMoney(Number(data.amount) || 0),
    category: (data.category as ExpenseCategory) || "miscellaneous",
    siteId: String(data.siteId ?? ""),
    siteName: String(data.siteName ?? ""),
    guardId: String(data.guardId ?? ""),
    guardName: String(data.guardName ?? ""),
    note: String(data.note ?? ""),
    status: data.status === "void" ? "void" : "active",
    createdByUid: String(data.createdByUid ?? ""),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

const VALID_CATEGORIES: ExpenseCategory[] = [
  "transport",
  "accommodation",
  "food",
  "miscellaneous",
];

export async function listAgencyExpenses(params: {
  agencyId: string;
  year?: number;
  month?: number;
  siteId?: string;
  guardId?: string;
  category?: ExpenseCategory;
  includeVoid?: boolean;
  /** When set, only expenses for this branch (via site/guard) + unattributed. */
  branchId?: string | null;
}): Promise<AgencyExpense[]> {
  const db = getFirestore();
  const snap = await db
    .collection(AGENCY_EXPENSES_COLLECTION)
    .where("agencyId", "==", params.agencyId)
    .get();

  let rows = snap.docs.map((d) =>
    mapExpense(d.id, (d.data() ?? {}) as Record<string, unknown>)
  );

  if (!params.includeVoid) {
    rows = rows.filter((r) => r.status === "active");
  }
  if (params.year != null && params.month != null) {
    const prefix = `${params.year}-${String(params.month).padStart(2, "0")}`;
    rows = rows.filter((r) => r.date.startsWith(prefix));
  } else if (params.year != null) {
    rows = rows.filter((r) => r.date.startsWith(`${params.year}-`));
  }
  if (params.siteId) {
    rows = rows.filter((r) => r.siteId === params.siteId);
  }
  if (params.guardId) {
    rows = rows.filter((r) => r.guardId === params.guardId);
  }
  if (params.category) {
    rows = rows.filter((r) => r.category === params.category);
  }
  if (params.branchId) {
    const [sitesSnap, guardsSnap] = await Promise.all([
      db.collection("sites").where("agencyId", "==", params.agencyId).get(),
      db.collection("guards").where("agencyId", "==", params.agencyId).get(),
    ]);
    const siteBranch = new Map<string, string>();
    for (const d of sitesSnap.docs) {
      const data = d.data() as { branchId?: string | null };
      siteBranch.set(
        d.id,
        data.branchId == null ? "" : String(data.branchId).trim()
      );
    }
    const guardBranch = new Map<string, string>();
    for (const d of guardsSnap.docs) {
      const data = d.data() as { branchId?: string | null };
      guardBranch.set(
        d.id,
        data.branchId == null ? "" : String(data.branchId).trim()
      );
    }
    const branchId = params.branchId;
    rows = rows.filter((r) => {
      const siteId = String(r.siteId ?? "").trim();
      const guardId = String(r.guardId ?? "").trim();
      if (siteId) {
        const b = siteBranch.get(siteId) ?? "";
        return b === "" || b === branchId;
      }
      if (guardId) {
        const b = guardBranch.get(guardId) ?? "";
        return b === "" || b === branchId;
      }
      // Unattributed agency expense — visible in every branch
      return true;
    });
  }

  rows.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return rows;
}

export async function getAgencyExpense(params: {
  agencyId: string;
  expenseId: string;
}): Promise<AgencyExpense> {
  const snap = await getFirestore()
    .collection(AGENCY_EXPENSES_COLLECTION)
    .doc(params.expenseId)
    .get();
  if (!snap.exists) throw httpError("Expense not found.", 404);
  const expense = mapExpense(
    snap.id,
    (snap.data() ?? {}) as Record<string, unknown>
  );
  if (expense.agencyId !== params.agencyId) {
    throw httpError("Expense not found.", 404);
  }
  return expense;
}

export async function createAgencyExpense(params: {
  agencyId: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  siteId?: string;
  guardId?: string;
  note?: string;
  createdByUid: string;
}): Promise<AgencyExpense> {
  const amount = roundMoney(Math.max(0, params.amount));
  if (amount <= 0) throw httpError("Expense amount must be greater than 0.", 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    throw httpError("date must be YYYY-MM-DD.", 400);
  }
  if (!VALID_CATEGORIES.includes(params.category)) {
    throw httpError("Invalid expense category.", 400);
  }

  const db = getFirestore();
  let siteId = String(params.siteId ?? "").trim();
  let siteName = "";
  let guardId = String(params.guardId ?? "").trim();
  let guardName = "";

  if (siteId) {
    const siteSnap = await db.collection("sites").doc(siteId).get();
    if (!siteSnap.exists || siteSnap.data()?.agencyId !== params.agencyId) {
      throw httpError("Site not found.", 404);
    }
    siteName = String(
      (siteSnap.data() as { siteName?: string }).siteName ?? ""
    ).trim();
  }

  if (guardId) {
    const guardSnap = await db.collection("guards").doc(guardId).get();
    if (!guardSnap.exists || guardSnap.data()?.agencyId !== params.agencyId) {
      throw httpError("Guard not found.", 404);
    }
    guardName = String(
      (guardSnap.data() as { fullName?: string }).fullName ?? ""
    ).trim();
  }

  const ref = db.collection(AGENCY_EXPENSES_COLLECTION).doc();
  const expense: AgencyExpense = {
    id: ref.id,
    agencyId: params.agencyId,
    date: params.date,
    amount,
    category: params.category,
    siteId,
    siteName,
    guardId,
    guardName,
    note: String(params.note ?? "").trim(),
    status: "active",
    createdByUid: params.createdByUid,
  };

  await ref.set({
    ...expense,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return expense;
}

export async function updateAgencyExpense(params: {
  agencyId: string;
  expenseId: string;
  patch: {
    date?: string;
    amount?: number;
    category?: ExpenseCategory;
    siteId?: string | null;
    guardId?: string | null;
    note?: string;
  };
}): Promise<AgencyExpense> {
  const existing = await getAgencyExpense({
    agencyId: params.agencyId,
    expenseId: params.expenseId,
  });
  if (existing.status === "void") {
    throw httpError("Cannot edit a void expense.", 400);
  }

  const db = getFirestore();
  let siteId = existing.siteId;
  let siteName = existing.siteName;
  let guardId = existing.guardId;
  let guardName = existing.guardName;

  if (params.patch.siteId !== undefined) {
    siteId = String(params.patch.siteId ?? "").trim();
    siteName = "";
    if (siteId) {
      const siteSnap = await db.collection("sites").doc(siteId).get();
      if (!siteSnap.exists || siteSnap.data()?.agencyId !== params.agencyId) {
        throw httpError("Site not found.", 404);
      }
      siteName = String(
        (siteSnap.data() as { siteName?: string }).siteName ?? ""
      ).trim();
    }
  }

  if (params.patch.guardId !== undefined) {
    guardId = String(params.patch.guardId ?? "").trim();
    guardName = "";
    if (guardId) {
      const guardSnap = await db.collection("guards").doc(guardId).get();
      if (!guardSnap.exists || guardSnap.data()?.agencyId !== params.agencyId) {
        throw httpError("Guard not found.", 404);
      }
      guardName = String(
        (guardSnap.data() as { fullName?: string }).fullName ?? ""
      ).trim();
    }
  }

  const date = params.patch.date ?? existing.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw httpError("date must be YYYY-MM-DD.", 400);
  }
  const amount =
    params.patch.amount != null
      ? roundMoney(Math.max(0, params.patch.amount))
      : existing.amount;
  if (amount <= 0) throw httpError("Expense amount must be greater than 0.", 400);

  const category = params.patch.category ?? existing.category;
  if (!VALID_CATEGORIES.includes(category)) {
    throw httpError("Invalid expense category.", 400);
  }

  await db
    .collection(AGENCY_EXPENSES_COLLECTION)
    .doc(params.expenseId)
    .set(
      {
        date,
        amount,
        category,
        siteId,
        siteName,
        guardId,
        guardName,
        note:
          params.patch.note != null
            ? String(params.patch.note).trim()
            : existing.note,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return getAgencyExpense({
    agencyId: params.agencyId,
    expenseId: params.expenseId,
  });
}

export async function voidAgencyExpense(params: {
  agencyId: string;
  expenseId: string;
}): Promise<AgencyExpense> {
  await getAgencyExpense(params);
  await getFirestore()
    .collection(AGENCY_EXPENSES_COLLECTION)
    .doc(params.expenseId)
    .set(
      {
        status: "void",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  return getAgencyExpense(params);
}

/** Sum active expenses in an inclusive month range, optionally per site. */
export async function sumExpensesForPeriod(params: {
  agencyId: string;
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
  /**
   * When provided, expenses whose siteId is missing OR not in this set count as
   * agency-level (general) so they still reduce overall profit.
   */
  knownSiteIds?: ReadonlySet<string>;
}): Promise<{
  total: number;
  bySiteId: Map<string, number>;
  unattributed: number;
  /** Active expenses with no usable site (agency-level / general). */
  unattributedRows: AgencyExpense[];
}> {
  const snap = await getFirestore()
    .collection(AGENCY_EXPENSES_COLLECTION)
    .where("agencyId", "==", params.agencyId)
    .get();

  const fromKey = params.fromYear * 12 + params.fromMonth;
  const toKey = params.toYear * 12 + params.toMonth;
  const bySiteId = new Map<string, number>();
  const unattributedRows: AgencyExpense[] = [];
  let unattributed = 0;
  let total = 0;
  const known = params.knownSiteIds;

  for (const doc of snap.docs) {
    const exp = mapExpense(doc.id, (doc.data() ?? {}) as Record<string, unknown>);
    if (exp.status !== "active") continue;
    const [y, m] = exp.date.split("-").map(Number);
    if (!Number.isInteger(y) || !Number.isInteger(m)) continue;
    const key = y * 12 + m;
    if (key < fromKey || key > toKey) continue;
    total = roundMoney(total + exp.amount);
    const siteId = String(exp.siteId ?? "").trim();
    const hasKnownSite = Boolean(siteId) && (!known || known.has(siteId));
    if (hasKnownSite) {
      bySiteId.set(
        siteId,
        roundMoney((bySiteId.get(siteId) ?? 0) + exp.amount)
      );
    } else {
      // No site, or site id that does not match an active site → agency spend.
      unattributed = roundMoney(unattributed + exp.amount);
      unattributedRows.push(exp);
    }
  }

  unattributedRows.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return { total, bySiteId, unattributed, unattributedRows };
}
