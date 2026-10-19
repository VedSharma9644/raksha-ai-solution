import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listGuardsByAgency } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import {
  EXPENSE_CATEGORY_OPTIONS,
  expenseCategoryLabel,
  recoveryStartOptions,
  type AdvanceRecoveryMode,
  type AgencyExpense,
  type EmployeeAdvance,
  type ExpenseCategory,
} from "@raskha/money-out";
import { listSitesByAgency } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import { APP_ROUTES } from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { useConfirmDialog } from "../../../components/ConfirmDialog";
import { PageHeader } from "../../../components/PageHeader";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { TextField } from "../../../components/TextField";
import { useAuthContext } from "../../authentication";
import { useBranchContext } from "../../branches";
import { filterByBranch } from "../../../lib/branchFilter";
import { EarningsPeriodSelect } from "../../earnings/EarningsPeriodSelect";
import { db } from "../../../lib/firebase";
import {
  createAdvanceApi,
  createExpenseApi,
  listAdvancesApi,
  listExpensesApi,
  repayAdvanceApi,
  updateExpenseApi,
  voidAdvanceApi,
  voidExpenseApi,
} from "../moneyOutApi";
import "./MoneyOutScreen.css";

type TabId = "advances" | "expenses";

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const RECOVERY_OPTIONS: Array<{ value: AdvanceRecoveryMode; label: string }> = [
  { value: "next_payroll", label: "Full cut on next payroll" },
  { value: "emi", label: "Monthly EMI (payroll)" },
  { value: "cash", label: "Cash repayment only" },
];

export function MoneyOutScreen() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const { confirm } = useConfirmDialog();
  const now = new Date();

  const [tab, setTab] = useState<TabId>("advances");
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [advances, setAdvances] = useState<EmployeeAdvance[]>([]);
  const [expenses, setExpenses] = useState<AgencyExpense[]>([]);
  const [advanceStatus, setAdvanceStatus] = useState("open");
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string | null>(
    null
  );

  const [advGuardId, setAdvGuardId] = useState("");
  const [advAmount, setAdvAmount] = useState("");
  const [advGivenOn, setAdvGivenOn] = useState(todayKey());
  const [advPurpose, setAdvPurpose] = useState("");
  const [advMode, setAdvMode] = useState<AdvanceRecoveryMode>("next_payroll");
  const [advEmiMonths, setAdvEmiMonths] = useState("3");
  const emiStartChoices = useMemo(() => recoveryStartOptions(), []);
  const [advEmiStart, setAdvEmiStart] = useState(
    () => recoveryStartOptions()[0]?.value ?? ""
  );

  const [expDate, setExpDate] = useState(todayKey());
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] =
    useState<ExpenseCategory>("miscellaneous");
  const [expSiteId, setExpSiteId] = useState("");
  const [expGuardId, setExpGuardId] = useState("");
  const [expNote, setExpNote] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [repayAmount, setRepayAmount] = useState("");
  const [repayDate, setRepayDate] = useState(todayKey());
  const [repayNote, setRepayNote] = useState("");

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    const years: { value: string; label: string }[] = [];
    for (let y = current + 1; y >= current - 7; y -= 1) {
      years.push({ value: String(y), label: String(y) });
    }
    return years;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const branchGuards = useMemo(
    () => filterByBranch(guards, activeBranchId),
    [guards, activeBranchId]
  );
  const branchSites = useMemo(
    () => filterByBranch(sites, activeBranchId),
    [sites, activeBranchId]
  );

  const guardOptions = useMemo(
    () => [
      { value: "", label: "Select guard…" },
      ...branchGuards.map((g) => ({
        value: g.id,
        label: g.employeeCode
          ? `${g.fullName || "Guard"} (${g.employeeCode})`
          : g.fullName || g.id,
      })),
    ],
    [branchGuards]
  );

  const siteOptions = useMemo(
    () => [
      { value: "", label: "No site (agency-wide)" },
      ...branchSites.map((s) => ({
        value: s.id,
        label: s.siteName || s.id,
      })),
    ],
    [branchSites]
  );

  const selectedAdvance = advances.find((a) => a.id === selectedAdvanceId) ?? null;

  async function loadAdvances() {
    const rows = await listAdvancesApi({
      status: advanceStatus,
      branchId: activeBranchId,
    });
    setAdvances(rows);
  }

  async function loadExpenses(opts?: { year?: number; month?: number }) {
    const rows = await listExpensesApi({
      year: opts?.year ?? Number(year),
      month: opts?.month ?? Number(month),
      branchId: activeBranchId,
    });
    setExpenses(rows);
  }

  useEffect(() => {
    if (!agency?.id) return;
    void Promise.all([
      listGuardsByAgency(db, agency.id).then((rows) =>
        setGuards(rows.filter((g) => (g.status ?? "active") === "active"))
      ),
      listSitesByAgency(db, agency.id).then((rows) =>
        setSites(rows.filter((s) => (s.status ?? "active") === "active"))
      ),
    ]).catch(() => undefined);
  }, [agency?.id]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");
    const load = tab === "advances" ? loadAdvances() : loadExpenses();
    void load
      .catch((err: unknown) => {
        if (!cancelled) {
          const e = err as { message?: string };
          setError(e.message ?? "Failed to load.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, advanceStatus, year, month, activeBranchId]);

  async function handleCreateAdvance() {
    if (!advGuardId) {
      setError("Select a guard for the advance.");
      return;
    }
    const startChoice =
      advMode === "emi" || advMode === "next_payroll"
        ? emiStartChoices.find((o) => o.value === advEmiStart)
        : undefined;
    if (
      (advMode === "emi" || advMode === "next_payroll") &&
      !startChoice
    ) {
      setError("Select when payroll recovery should start.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const advance = await createAdvanceApi({
        guardId: advGuardId,
        amount: Number(advAmount),
        givenOn: advGivenOn,
        purpose: advPurpose,
        recoveryMode: advMode,
        emiMonths: advMode === "emi" ? Number(advEmiMonths) : undefined,
        recoveryStartYear: startChoice?.year,
        recoveryStartMonth: startChoice?.month,
      });
      setAdvAmount("");
      setAdvPurpose("");
      setAdvEmiStart(emiStartChoices[0]?.value ?? "");
      setSelectedAdvanceId(advance.id);
      await loadAdvances();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to create advance.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRepay() {
    if (!selectedAdvance) return;
    setIsSaving(true);
    setError("");
    try {
      await repayAdvanceApi(selectedAdvance.id, {
        amount: Number(repayAmount),
        date: repayDate,
        note: repayNote,
      });
      setRepayAmount("");
      setRepayNote("");
      await loadAdvances();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to record repayment.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVoidAdvance(advance: EmployeeAdvance) {
    const ok = await confirm({
      title: "Void advance?",
      message: `Void advance for ${advance.guardName} (${formatMoney(advance.amount)})? Only allowed if nothing has been recovered yet.`,
      confirmLabel: "Void",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!ok) return;
    setIsSaving(true);
    setError("");
    try {
      await voidAdvanceApi(advance.id);
      if (selectedAdvanceId === advance.id) setSelectedAdvanceId(null);
      await loadAdvances();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to void advance.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetExpenseForm() {
    setEditingExpenseId(null);
    setExpDate(todayKey());
    setExpAmount("");
    setExpCategory("miscellaneous");
    setExpSiteId("");
    setExpGuardId("");
    setExpNote("");
  }

  function startEditExpense(expense: AgencyExpense) {
    setError("");
    setEditingExpenseId(expense.id);
    setExpDate(expense.date || todayKey());
    setExpAmount(String(expense.amount ?? ""));
    setExpCategory(expense.category || "miscellaneous");
    setExpSiteId(expense.siteId || "");
    setExpGuardId(expense.guardId || "");
    setExpNote(expense.note || "");
    setTab("expenses");
  }

  async function handleSaveExpense() {
    setIsSaving(true);
    setError("");
    try {
      const amount = Number(expAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw Object.assign(new Error("Enter a valid expense amount."), {
          statusCode: 400,
        });
      }
      if (editingExpenseId) {
        await updateExpenseApi(editingExpenseId, {
          date: expDate,
          amount,
          category: expCategory,
          siteId: expSiteId || null,
          guardId: expGuardId || null,
          note: expNote,
        });
      } else {
        await createExpenseApi({
          date: expDate,
          amount,
          category: expCategory,
          siteId: expSiteId || undefined,
          guardId: expGuardId || undefined,
          note: expNote,
        });
      }
      // If the date moved to another month, keep the list on the expense month.
      const [y, m] = expDate.split("-");
      const listYear = y ? Number(y) : Number(year);
      const listMonth = m ? Number(m) : Number(month);
      if (y && m) {
        setYear(y);
        setMonth(String(listMonth));
      }
      resetExpenseForm();
      await loadExpenses({ year: listYear, month: listMonth });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(
        e.message ??
          (editingExpenseId
            ? "Failed to update expense."
            : "Failed to create expense.")
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVoidExpense(expense: AgencyExpense) {
    const ok = await confirm({
      title: "Void expense?",
      message: `Void ${expenseCategoryLabel(expense.category)} expense of ${formatMoney(expense.amount)} on ${expense.date}?`,
      confirmLabel: "Void",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!ok) return;
    setIsSaving(true);
    setError("");
    try {
      await voidExpenseApi(expense.id);
      if (editingExpenseId === expense.id) {
        resetExpenseForm();
      }
      await loadExpenses();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to void expense.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content money-out">
        <PageHeader
          title="Money out"
          subtitle="Employee advances (payroll recovery) and day-to-day expenses."
          onBack={() => navigate(APP_ROUTES.paymentManagement)}
          backLabel="Back to payment management"
        />

        <div className="money-out__tabs" role="tablist" aria-label="Money out">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "advances"}
            className={
              tab === "advances"
                ? "money-out__tab money-out__tab--active"
                : "money-out__tab"
            }
            onClick={() => setTab("advances")}
          >
            Advances
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "expenses"}
            className={
              tab === "expenses"
                ? "money-out__tab money-out__tab--active"
                : "money-out__tab"
            }
            onClick={() => setTab("expenses")}
          >
            Expenses
          </button>
        </div>

        {error ? (
          <p className="money-out__error" role="alert">
            {error}
          </p>
        ) : null}

        {tab === "advances" ? (
          <div className="money-out__grid">
            <section className="money-out__panel">
              <h2 className="money-out__panel-title">New advance</h2>
              <p className="money-out__hint">
                Give money to a guard and choose how it comes back — next
                payroll, EMI, or cash. For payroll recovery, pick which month
                the first deduction starts (this month up to 5 months later).
              </p>
              <div className="money-out__form">
                <SearchableSelect
                  label="Guard"
                  name="advGuard"
                  value={advGuardId}
                  options={guardOptions}
                  onChange={setAdvGuardId}
                  searchPlaceholder="Search guard name or code…"
                />
                <TextField
                  label="Amount (₹)"
                  name="advAmount"
                  value={advAmount}
                  onChange={(e) => setAdvAmount(e.target.value)}
                />
                <TextField
                  label="Given on"
                  name="advGivenOn"
                  type="date"
                  value={advGivenOn}
                  onChange={(e) => setAdvGivenOn(e.target.value)}
                />
                <TextField
                  label="Purpose / note"
                  name="advPurpose"
                  value={advPurpose}
                  onChange={(e) => setAdvPurpose(e.target.value)}
                />
                <EarningsPeriodSelect
                  label="Recovery"
                  name="advMode"
                  value={advMode}
                  options={RECOVERY_OPTIONS}
                  onChange={(v) => setAdvMode(v as AdvanceRecoveryMode)}
                />
                {advMode === "emi" ? (
                  <TextField
                    label="EMI months"
                    name="advEmi"
                    type="number"
                    min={1}
                    max={36}
                    value={advEmiMonths}
                    onChange={(e) => setAdvEmiMonths(e.target.value)}
                  />
                ) : null}
                {advMode === "emi" || advMode === "next_payroll" ? (
                  <EarningsPeriodSelect
                    label="EMI / recovery starts"
                    name="advEmiStart"
                    value={advEmiStart}
                    options={emiStartChoices.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    onChange={setAdvEmiStart}
                  />
                ) : null}
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void handleCreateAdvance()}
                >
                  {isSaving ? "Saving…" : "Create advance"}
                </Button>
              </div>
            </section>

            <section className="money-out__panel">
              <div className="money-out__panel-head">
                <h2 className="money-out__panel-title">Advances</h2>
                <EarningsPeriodSelect
                  label="Status"
                  name="advStatus"
                  value={advanceStatus}
                  options={[
                    { value: "open", label: "Open" },
                    { value: "settled", label: "Settled" },
                    { value: "void", label: "Void" },
                    { value: "all", label: "All" },
                  ]}
                  onChange={setAdvanceStatus}
                />
              </div>
              {isLoading ? (
                <p className="money-out__hint">Loading…</p>
              ) : advances.length === 0 ? (
                <p className="money-out__hint">No advances in this filter.</p>
              ) : (
                <div className="money-out__table-wrap">
                  <table className="money-out__table">
                    <thead>
                      <tr>
                        <th>Guard</th>
                        <th>Given</th>
                        <th>Amount</th>
                        <th>Outstanding</th>
                        <th>Mode</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advances.map((a) => (
                        <tr
                          key={a.id}
                          className={
                            selectedAdvanceId === a.id
                              ? "money-out__row--selected"
                              : undefined
                          }
                        >
                          <td>
                            <button
                              type="button"
                              className="money-out__link"
                              onClick={() => setSelectedAdvanceId(a.id)}
                            >
                              {a.guardName}
                            </button>
                          </td>
                          <td>{a.givenOn}</td>
                          <td>{formatMoney(a.amount)}</td>
                          <td>{formatMoney(a.outstanding)}</td>
                          <td>{a.recoveryMode.replace("_", " ")}</td>
                          <td>
                            <span
                              className={`money-out__badge money-out__badge--${a.status}`}
                            >
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedAdvance ? (
                <div className="money-out__detail">
                  <h3 className="money-out__detail-title">
                    {selectedAdvance.guardName} —{" "}
                    {formatMoney(selectedAdvance.amount)}
                  </h3>
                  <p className="money-out__hint">
                    Outstanding {formatMoney(selectedAdvance.outstanding)} ·
                    Recovered {formatMoney(selectedAdvance.recoveredTotal)}
                    {selectedAdvance.recoveryStartYear != null &&
                    selectedAdvance.recoveryStartMonth != null
                      ? ` · Starts ${selectedAdvance.recoveryStartYear}-${String(selectedAdvance.recoveryStartMonth).padStart(2, "0")}`
                      : ""}
                    {selectedAdvance.purpose
                      ? ` · ${selectedAdvance.purpose}`
                      : ""}
                  </p>

                  {selectedAdvance.installments.length > 0 ? (
                    <div className="money-out__table-wrap">
                      <table className="money-out__table">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAdvance.installments.map((inst) => (
                            <tr key={inst.id}>
                              <td>
                                {inst.year}-
                                {String(inst.month).padStart(2, "0")}
                              </td>
                              <td>{formatMoney(inst.amount)}</td>
                              <td>{inst.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="money-out__hint">
                      Cash recovery — no payroll schedule.
                    </p>
                  )}

                  {selectedAdvance.status === "open" ? (
                    <div className="money-out__form money-out__form--inline">
                      <TextField
                        label="Cash repayment (₹)"
                        name="repayAmount"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                      />
                      <TextField
                        label="Date"
                        name="repayDate"
                        type="date"
                        value={repayDate}
                        onChange={(e) => setRepayDate(e.target.value)}
                      />
                      <TextField
                        label="Note"
                        name="repayNote"
                        value={repayNote}
                        onChange={(e) => setRepayNote(e.target.value)}
                      />
                      <Button
                        type="button"
                        disabled={isSaving}
                        onClick={() => void handleRepay()}
                      >
                        Record cash repayment
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSaving}
                        onClick={() => void handleVoidAdvance(selectedAdvance)}
                      >
                        Void advance
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        ) : (
          <div className="money-out__grid">
            <section className="money-out__panel">
              <h2 className="money-out__panel-title">
                {editingExpenseId ? "Edit expense" : "Add expense"}
              </h2>
              <p className="money-out__hint">
                Transport, food, accommodation, or misc. Site and guard are
                optional — leave Site empty for agency-wide costs (for example a
                staff party). Those still reduce Earnings net profit.
              </p>
              <div className="money-out__form">
                <TextField
                  label="Date"
                  name="expDate"
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                />
                <TextField
                  label="Amount (₹)"
                  name="expAmount"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                />
                <EarningsPeriodSelect
                  label="Category"
                  name="expCategory"
                  value={expCategory}
                  options={EXPENSE_CATEGORY_OPTIONS}
                  onChange={(v) => setExpCategory(v as ExpenseCategory)}
                />
                <SearchableSelect
                  label="Site (optional)"
                  name="expSite"
                  value={expSiteId}
                  options={siteOptions}
                  onChange={setExpSiteId}
                  searchPlaceholder="Search site name…"
                />
                <SearchableSelect
                  label="Guard (optional)"
                  name="expGuard"
                  value={expGuardId}
                  options={[
                    { value: "", label: "No guard" },
                    ...guardOptions.slice(1),
                  ]}
                  onChange={setExpGuardId}
                  searchPlaceholder="Search guard name or code…"
                />
                <TextField
                  label="Note"
                  name="expNote"
                  value={expNote}
                  onChange={(e) => setExpNote(e.target.value)}
                />
                <div className="money-out__form-actions">
                  <Button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleSaveExpense()}
                  >
                    {isSaving
                      ? "Saving…"
                      : editingExpenseId
                        ? "Save changes"
                        : "Add expense"}
                  </Button>
                  {editingExpenseId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isSaving}
                      onClick={resetExpenseForm}
                    >
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="money-out__panel">
              <div className="money-out__panel-head">
                <h2 className="money-out__panel-title">Expenses</h2>
                <div className="money-out__filters">
                  <EarningsPeriodSelect
                    label="Year"
                    name="expYear"
                    value={year}
                    options={yearOptions}
                    onChange={setYear}
                  />
                  <EarningsPeriodSelect
                    label="Month"
                    name="expMonth"
                    value={month}
                    options={MONTH_OPTIONS}
                    onChange={setMonth}
                  />
                </div>
              </div>
              {isLoading ? (
                <p className="money-out__hint">Loading…</p>
              ) : expenses.length === 0 ? (
                <p className="money-out__hint">No expenses for this month.</p>
              ) : (
                <div className="money-out__table-wrap">
                  <table className="money-out__table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Site</th>
                        <th>Guard</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id}>
                          <td>{e.date}</td>
                          <td>{expenseCategoryLabel(e.category)}</td>
                          <td>{formatMoney(e.amount)}</td>
                          <td>{e.siteName || "—"}</td>
                          <td>{e.guardName || "—"}</td>
                          <td className="money-out__row-actions">
                            <button
                              type="button"
                              className="money-out__link"
                              disabled={isSaving}
                              onClick={() => startEditExpense(e)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="money-out__link money-out__link--danger"
                              disabled={isSaving}
                              onClick={() => void handleVoidExpense(e)}
                            >
                              Void
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AppScreenLayout>
  );
}
