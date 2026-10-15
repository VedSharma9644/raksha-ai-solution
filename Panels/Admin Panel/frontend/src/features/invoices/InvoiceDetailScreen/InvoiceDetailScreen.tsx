import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  computeInvoiceTotals,
  lineAmount,
  newLineId,
  type InvoiceLineItem,
  type SiteInvoice,
} from "@raskha/invoices";
import { APP_ROUTES } from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { useConfirmDialog } from "../../../components/ConfirmDialog";
import { PageHeader } from "../../../components/PageHeader";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import {
  deleteInvoiceDraftApi,
  downloadInvoicePdfApi,
  fetchInvoiceApi,
  updateInvoiceApi,
} from "../invoiceApi";
import "./InvoiceDetailScreen.css";

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function emptyCustomLine(): InvoiceLineItem {
  return {
    id: newLineId(),
    description: "Extra / custom charge",
    quantity: 1,
    unitRate: 0,
    amount: 0,
    kind: "custom",
    note: "",
  };
}

export function InvoiceDetailScreen() {
  const { invoiceId = "" } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [invoice, setInvoice] = useState<SiteInvoice | null>(null);
  const [lines, setLines] = useState<InvoiceLineItem[]>([]);
  const [taxPercent, setTaxPercent] = useState("0");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const locked = invoice?.status === "finalized" || invoice?.status === "void";

  const totals = useMemo(
    () => computeInvoiceTotals(lines, Number(taxPercent) || 0),
    [lines, taxPercent]
  );

  useEffect(() => {
    if (!invoiceId) return;
    let cancelled = false;
    setIsLoading(true);
    fetchInvoiceApi(invoiceId)
      .then((data) => {
        if (cancelled) return;
        setInvoice(data);
        setLines(data.lineItems ?? []);
        setTaxPercent(String(data.taxPercent ?? 0));
        setNotes(data.notes ?? "");
        setDueDate(data.dueDate ?? "");
        setIssueDate(data.issueDate ?? "");
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const e = err as { message?: string };
          setError(e.message ?? "Failed to load invoice.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  function updateLine(id: string, patch: Partial<InvoiceLineItem>) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const next = { ...line, ...patch };
        next.amount = lineAmount(next.quantity, next.unitRate);
        return next;
      })
    );
  }

  async function save(patchExtra?: { status?: SiteInvoice["status"] }) {
    if (!invoice) return;
    setIsSaving(true);
    setError("");
    try {
      const updated = await updateInvoiceApi(invoice.id, {
        lineItems: lines,
        taxPercent: Number(taxPercent) || 0,
        notes,
        dueDate,
        issueDate,
        status: patchExtra?.status,
      });
      setInvoice(updated);
      setLines(updated.lineItems);
      setTaxPercent(String(updated.taxPercent));
      setNotes(updated.notes);
      setDueDate(updated.dueDate);
      setIssueDate(updated.issueDate);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save invoice.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePdf() {
    if (!invoice) return;
    setError("");
    try {
      await downloadInvoicePdfApi(invoice.id);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to download PDF.");
    }
  }

  async function handleDeleteDraft() {
    if (!invoice || invoice.status !== "draft") return;
    const ok = await confirm({
      title: "Delete draft invoice?",
      message: `Delete draft ${invoice.invoiceNumber}? This cannot be undone.`,
      confirmLabel: "Delete draft",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!ok) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteInvoiceDraftApi(invoice.id);
      navigate(APP_ROUTES.invoices);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete draft.");
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <AppScreenLayout>
        <div className="app-screen-layout__content">
          <p>Loading invoice…</p>
        </div>
      </AppScreenLayout>
    );
  }

  if (!invoice) {
    return (
      <AppScreenLayout>
        <div className="app-screen-layout__content">
          <p role="alert">{error || "Invoice not found."}</p>
          <Button type="button" onClick={() => navigate(APP_ROUTES.invoices)}>
            Back to invoices
          </Button>
        </div>
      </AppScreenLayout>
    );
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content invoice-detail">
        <PageHeader
          title={invoice.invoiceNumber}
          subtitle={`${invoice.siteName} · ${invoice.period.label}`}
          onBack={() => navigate(APP_ROUTES.invoices)}
          backLabel="Back to invoices"
          actions={
            <div className="invoice-detail__actions no-print">
              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={() => void handlePdf()}
              >
                Download PDF
              </Button>
              {!locked ? (
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void save()}
                >
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              ) : null}
              {invoice.status === "draft" ? (
                <>
                  <Button
                    type="button"
                    disabled={isSaving || isDeleting}
                    onClick={() => void save({ status: "finalized" })}
                  >
                    Finalize
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSaving || isDeleting}
                    onClick={() => void handleDeleteDraft()}
                  >
                    {isDeleting ? "Deleting…" : "Delete draft"}
                  </Button>
                </>
              ) : null}
              {invoice.status === "finalized" ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSaving}
                  onClick={() => void save({ status: "draft" })}
                >
                  Unlock to draft
                </Button>
              ) : null}
            </div>
          }
        />

        {error ? (
          <p className="invoice-detail__error no-print" role="alert">
            {error}
          </p>
        ) : null}

        <article className="invoice-sheet">
          <header className="invoice-sheet__header">
            <div>
              <h1 className="invoice-sheet__brand">
                {invoice.billFrom.legalName || "Security Agency"}
              </h1>
              <p className="invoice-sheet__muted">
                {[invoice.billFrom.address, invoice.billFrom.phone, invoice.billFrom.email]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {invoice.billFrom.gstin ? (
                <p className="invoice-sheet__muted">
                  GSTIN: {invoice.billFrom.gstin}
                </p>
              ) : null}
            </div>
            <div className="invoice-sheet__meta">
              <p className="invoice-sheet__eyebrow">Invoice</p>
              <strong>{invoice.invoiceNumber}</strong>
              <span className={`invoice-sheet__status invoice-sheet__status--${invoice.status}`}>
                {invoice.status}
              </span>
              <p className="invoice-sheet__muted">
                Period: {invoice.period.label} ({invoice.period.daysInMonth} days)
              </p>
            </div>
          </header>

          <div className="invoice-sheet__parties">
            <div>
              <p className="invoice-sheet__eyebrow">Bill to</p>
              <strong>{invoice.billTo.name}</strong>
              <p className="invoice-sheet__muted">
                {[invoice.billTo.address, invoice.billTo.city]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
            <div className="invoice-sheet__dates no-print">
              <TextField
                label="Issue date"
                name="issueDate"
                type="date"
                value={issueDate}
                disabled={locked || isSaving}
                onChange={(e) => setIssueDate(e.target.value)}
              />
              <TextField
                label="Due date"
                name="dueDate"
                type="date"
                value={dueDate}
                disabled={locked || isSaving}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="invoice-sheet__dates-print only-print">
              <p>Issue: {issueDate || "—"}</p>
              <p>Due: {dueDate || "—"}</p>
            </div>
          </div>

          <div className="invoice-sheet__table-wrap">
            <table className="invoice-sheet__table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  {!locked ? <th className="no-print" /> : null}
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td>
                      {locked ? (
                        <>
                          <div>{line.description}</div>
                          {line.note ? (
                            <div className="invoice-sheet__note">{line.note}</div>
                          ) : null}
                        </>
                      ) : (
                        <div className="invoice-sheet__line-edit">
                          <input
                            value={line.description}
                            onChange={(e) =>
                              updateLine(line.id, {
                                description: e.target.value,
                              })
                            }
                            aria-label="Description"
                          />
                          <input
                            value={line.note ?? ""}
                            placeholder="Note (e.g. Extra guard for 2 days)"
                            onChange={(e) =>
                              updateLine(line.id, { note: e.target.value })
                            }
                            aria-label="Line note"
                          />
                        </div>
                      )}
                    </td>
                    <td>
                      {locked ? (
                        line.quantity
                      ) : (
                        <input
                          type="number"
                          min={0}
                          step="1"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.id, {
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                          aria-label="Quantity"
                        />
                      )}
                    </td>
                    <td>
                      {locked ? (
                        formatMoney(line.unitRate)
                      ) : (
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.unitRate}
                          onChange={(e) =>
                            updateLine(line.id, {
                              unitRate: Number(e.target.value) || 0,
                            })
                          }
                          aria-label="Unit rate"
                        />
                      )}
                    </td>
                    <td>{formatMoney(line.amount)}</td>
                    {!locked ? (
                      <td className="no-print">
                        <button
                          type="button"
                          className="invoice-sheet__remove"
                          onClick={() =>
                            setLines((prev) =>
                              prev.filter((l) => l.id !== line.id)
                            )
                          }
                        >
                          Remove
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!locked ? (
            <div className="no-print">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setLines((prev) => [...prev, emptyCustomLine()])}
              >
                Add custom line
              </Button>
            </div>
          ) : null}

          <div className="invoice-sheet__totals">
            <div className="invoice-sheet__tax no-print">
              <TextField
                label="Tax / GST %"
                name="taxPercent"
                value={taxPercent}
                disabled={locked || isSaving}
                onChange={(e) => setTaxPercent(e.target.value)}
              />
            </div>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatMoney(totals.subtotal)}</dd>
              </div>
              <div>
                <dt>Tax ({Number(taxPercent) || 0}%)</dt>
                <dd>{formatMoney(totals.taxAmount)}</dd>
              </div>
              <div className="invoice-sheet__grand">
                <dt>Total</dt>
                <dd>{formatMoney(totals.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="invoice-sheet__notes">
            {locked ? (
              <>
                <p className="invoice-sheet__eyebrow">Notes</p>
                <p>{notes || "—"}</p>
              </>
            ) : (
              <TextAreaField
                label="Notes"
                name="invoiceNotes"
                value={notes}
                rows={3}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSaving}
              />
            )}
          </div>

          <footer className="invoice-sheet__signature">
            <div>
              <p className="invoice-sheet__eyebrow">
                {invoice.signature.label || "Authorized Signatory"}
              </p>
              <div className="invoice-sheet__sign-line" />
              <p className="invoice-sheet__sign-hint">
                External digital signature field reserved for hardware key
                (pendrive) — coming soon.
              </p>
            </div>
            {invoice.billFrom.footerText ? (
              <p className="invoice-sheet__footer-text">
                {invoice.billFrom.footerText}
              </p>
            ) : null}
          </footer>
        </article>
      </div>
    </AppScreenLayout>
  );
}
