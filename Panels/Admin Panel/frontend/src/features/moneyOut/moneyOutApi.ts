import type {
  AdvanceRecoveryMode,
  AgencyExpense,
  EmployeeAdvance,
  ExpenseCategory,
} from "@raskha/money-out";
import { adminFetch } from "@raskha/shared";

export async function listAdvancesApi(params?: {
  guardId?: string;
  status?: string;
}): Promise<EmployeeAdvance[]> {
  const qs = new URLSearchParams();
  if (params?.guardId) qs.set("guardId", params.guardId);
  if (params?.status) qs.set("status", params.status);
  const q = qs.toString();
  const data = await adminFetch<{ advances: EmployeeAdvance[] }>(
    `/api/money-out/advances${q ? `?${q}` : ""}`
  );
  return data.advances ?? [];
}

export async function createAdvanceApi(body: {
  guardId: string;
  amount: number;
  givenOn: string;
  purpose?: string;
  recoveryMode: AdvanceRecoveryMode;
  emiMonths?: number;
  recoveryStartYear?: number;
  recoveryStartMonth?: number;
}): Promise<EmployeeAdvance> {
  const data = await adminFetch<{ advance: EmployeeAdvance }>(
    "/api/money-out/advances",
    { method: "POST", body: JSON.stringify(body) }
  );
  return data.advance;
}

export async function fetchAdvanceApi(
  advanceId: string
): Promise<EmployeeAdvance> {
  const data = await adminFetch<{ advance: EmployeeAdvance }>(
    `/api/money-out/advances/${encodeURIComponent(advanceId)}`
  );
  return data.advance;
}

export async function repayAdvanceApi(
  advanceId: string,
  body: { amount: number; date: string; note?: string }
): Promise<EmployeeAdvance> {
  const data = await adminFetch<{ advance: EmployeeAdvance }>(
    `/api/money-out/advances/${encodeURIComponent(advanceId)}/repay`,
    { method: "POST", body: JSON.stringify(body) }
  );
  return data.advance;
}

export async function voidAdvanceApi(
  advanceId: string
): Promise<EmployeeAdvance> {
  const data = await adminFetch<{ advance: EmployeeAdvance }>(
    `/api/money-out/advances/${encodeURIComponent(advanceId)}/void`,
    { method: "POST", body: JSON.stringify({}) }
  );
  return data.advance;
}

export async function listExpensesApi(params?: {
  year?: number;
  month?: number;
  siteId?: string;
  guardId?: string;
  category?: ExpenseCategory;
}): Promise<AgencyExpense[]> {
  const qs = new URLSearchParams();
  if (params?.year != null) qs.set("year", String(params.year));
  if (params?.month != null) qs.set("month", String(params.month));
  if (params?.siteId) qs.set("siteId", params.siteId);
  if (params?.guardId) qs.set("guardId", params.guardId);
  if (params?.category) qs.set("category", params.category);
  const q = qs.toString();
  const data = await adminFetch<{ expenses: AgencyExpense[] }>(
    `/api/money-out/expenses${q ? `?${q}` : ""}`
  );
  return data.expenses ?? [];
}

export async function createExpenseApi(body: {
  date: string;
  amount: number;
  category: ExpenseCategory;
  siteId?: string;
  guardId?: string;
  note?: string;
}): Promise<AgencyExpense> {
  const data = await adminFetch<{ expense: AgencyExpense }>(
    "/api/money-out/expenses",
    { method: "POST", body: JSON.stringify(body) }
  );
  return data.expense;
}

export async function updateExpenseApi(
  expenseId: string,
  body: {
    date?: string;
    amount?: number;
    category?: ExpenseCategory;
    siteId?: string | null;
    guardId?: string | null;
    note?: string;
  }
): Promise<AgencyExpense> {
  const data = await adminFetch<{ expense: AgencyExpense }>(
    `/api/money-out/expenses/${encodeURIComponent(expenseId)}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
  return data.expense;
}

export async function voidExpenseApi(
  expenseId: string
): Promise<AgencyExpense> {
  const data = await adminFetch<{ expense: AgencyExpense }>(
    `/api/money-out/expenses/${encodeURIComponent(expenseId)}/void`,
    { method: "POST", body: JSON.stringify({}) }
  );
  return data.expense;
}
