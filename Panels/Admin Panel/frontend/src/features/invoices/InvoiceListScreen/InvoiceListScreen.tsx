import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listSitesByAgency } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import type { SiteInvoice } from "@raskha/invoices";
import { APP_ROUTES, invoiceDetailPath } from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { useAuthContext } from "../../authentication";
import { db } from "../../../lib/firebase";
import { EarningsPeriodSelect } from "../../earnings/EarningsPeriodSelect";
import {
  createInvoiceDraftApi,
  listInvoicesApi,
} from "../invoiceApi";
import "./InvoiceListScreen.css";

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
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

export function InvoiceListScreen() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [siteId, setSiteId] = useState("");
  const [createSiteId, setCreateSiteId] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  const [invoices, setInvoices] = useState<SiteInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    const years: { value: string; label: string }[] = [];
    for (let y = current + 1; y >= current - 7; y -= 1) {
      years.push({ value: String(y), label: String(y) });
    }
    return years;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const siteOptions = useMemo(
    () => [
      { value: "", label: "All sites" },
      ...sites.map((s) => ({
        value: s.id,
        label: s.siteName || s.id,
      })),
    ],
    [sites]
  );

  const createSiteOptions = useMemo(
    () => [
      { value: "", label: "Select site…" },
      ...sites.map((s) => ({
        value: s.id,
        label: s.siteName || s.id,
      })),
    ],
    [sites]
  );

  async function loadInvoices() {
    setIsLoading(true);
    setError("");
    try {
      const y = Number(year);
      const m = Number(month);
      const data = await listInvoicesApi({
        year: y,
        month: m,
        siteId: siteId || undefined,
      });
      setInvoices(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load invoices.");
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!agency?.id) return;
    void listSitesByAgency(db, agency.id)
      .then((rows) =>
        setSites(rows.filter((s) => (s.status ?? "active") === "active"))
      )
      .catch(() => setSites([]));
  }, [agency?.id]);

  useEffect(() => {
    void loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, siteId]);

  async function handleCreate() {
    if (!createSiteId) {
      setError("Select a site to create an invoice.");
      return;
    }
    setIsCreating(true);
    setError("");
    try {
      const invoice = await createInvoiceDraftApi({
        siteId: createSiteId,
        year: Number(year),
        month: Number(month),
      });
      navigate(invoiceDetailPath(invoice.id));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to create invoice.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content invoice-list">
        <PageHeader
          title="Invoices"
          subtitle="Create and manage monthly site invoices for clients."
          onBack={() => navigate(APP_ROUTES.paymentManagement)}
          backLabel="Back to payment management"
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(APP_ROUTES.invoiceSettings)}
            >
              Invoice settings
            </Button>
          }
        />

        <section className="invoice-list__panel">
          <div className="invoice-list__panel-head">
            <div>
              <h2 className="invoice-list__panel-title">Period & site</h2>
              <p className="invoice-list__panel-hint">
                Drafts use the site’s contracted shift headcount × monthly client
                rates (assignments are not required). Edit lines for extras.
              </p>
            </div>
          </div>

          <div className="invoice-list__filters">
            <EarningsPeriodSelect
              label="Year"
              name="invoiceYear"
              value={year}
              options={yearOptions}
              onChange={setYear}
            />
            <EarningsPeriodSelect
              label="Month"
              name="invoiceMonth"
              value={month}
              options={MONTH_OPTIONS}
              onChange={setMonth}
            />
            <SearchableSelect
              label="Site"
              name="invoiceSite"
              value={siteId}
              options={siteOptions}
              onChange={setSiteId}
              searchPlaceholder="Search site name…"
            />
          </div>

          <div className="invoice-list__create">
            <SearchableSelect
              label="Create draft for site"
              name="createSite"
              value={createSiteId}
              options={createSiteOptions}
              onChange={setCreateSiteId}
              searchPlaceholder="Search site name…"
            />
            <Button
              type="button"
              disabled={isCreating || !createSiteId}
              onClick={() => void handleCreate()}
            >
              {isCreating ? "Creating…" : "Create invoice draft"}
            </Button>
          </div>
        </section>

        {error ? (
          <p className="invoice-list__error" role="alert">
            {error}
          </p>
        ) : null}

        <section className="invoice-list__panel">
          <h2 className="invoice-list__panel-title">Invoices</h2>
          {isLoading ? (
            <p className="invoice-list__hint">Loading…</p>
          ) : invoices.length === 0 ? (
            <p className="invoice-list__hint">
              No invoices for this period. Select a site and create a draft.
            </p>
          ) : (
            <div className="invoice-list__table-wrap">
              <table className="invoice-list__table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Site</th>
                    <th>Client</th>
                    <th>Period</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <button
                          type="button"
                          className="invoice-list__link"
                          onClick={() => navigate(invoiceDetailPath(inv.id))}
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td>{inv.siteName}</td>
                      <td>{inv.clientName || "—"}</td>
                      <td>{inv.period.label}</td>
                      <td>{formatMoney(inv.total)}</td>
                      <td>
                        <span
                          className={`invoice-list__badge invoice-list__badge--${inv.status}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppScreenLayout>
  );
}
