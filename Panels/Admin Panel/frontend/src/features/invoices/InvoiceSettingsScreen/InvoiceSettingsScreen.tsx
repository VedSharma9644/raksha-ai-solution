import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AgencyInvoiceSettings } from "@raskha/invoices";
import { APP_ROUTES } from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { PageHeader } from "../../../components/PageHeader";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import {
  fetchInvoiceSettingsApi,
  saveInvoiceSettingsApi,
} from "../invoiceApi";
import "./InvoiceSettingsScreen.css";

export function InvoiceSettingsScreen() {
  const navigate = useNavigate();
  const [values, setValues] = useState<AgencyInvoiceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchInvoiceSettingsApi()
      .then((settings) => {
        if (!cancelled) setValues(settings);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const e = err as { message?: string };
          setError(e.message ?? "Failed to load invoice settings.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function patch<K extends keyof AgencyInvoiceSettings>(
    key: K,
    value: AgencyInvoiceSettings[K]
  ) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values) return;
    setIsSaving(true);
    setError("");
    setSaved(false);
    try {
      const next = await saveInvoiceSettingsApi(values);
      setValues(next);
      setSaved(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save invoice settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content invoice-settings">
        <PageHeader
          title="Invoice settings"
          subtitle="Letterhead, GST, default tax, and signature placeholder for site invoices."
          onBack={() => navigate(APP_ROUTES.invoices)}
          backLabel="Back to invoices"
        />

        {isLoading || !values ? (
          <p className="invoice-settings__hint">
            {error || "Loading settings…"}
          </p>
        ) : (
          <form
            className="invoice-settings__form"
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
          >
            <FormPanel className="form-panel--wide">
              <div className="form-panel__grid">
                <p className="invoice-settings__section">Bill from (letterhead)</p>
                <TextField
                  label="Legal name"
                  name="legalName"
                  value={values.legalName}
                  onChange={(e) => patch("legalName", e.target.value)}
                  disabled={isSaving}
                  required
                />
                <TextAreaField
                  label="Address"
                  name="address"
                  value={values.address}
                  rows={3}
                  onChange={(e) => patch("address", e.target.value)}
                  disabled={isSaving}
                />
                <TextField
                  label="GSTIN"
                  name="gstin"
                  value={values.gstin}
                  onChange={(e) => patch("gstin", e.target.value)}
                  disabled={isSaving}
                />
                <TextField
                  label="Phone"
                  name="phone"
                  value={values.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  disabled={isSaving}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => patch("email", e.target.value)}
                  disabled={isSaving}
                />
                <TextField
                  label="Logo URL (optional)"
                  name="logoUrl"
                  value={values.logoUrl}
                  onChange={(e) => patch("logoUrl", e.target.value)}
                  hint="Paste a public image URL for now. Upload support can come later."
                  disabled={isSaving}
                />

                <p className="invoice-settings__section">Tax & footer</p>
                <TextField
                  label="Default GST / tax %"
                  name="defaultTaxPercent"
                  type="number"
                  min={0}
                  step="0.01"
                  value={String(values.defaultTaxPercent)}
                  onChange={(e) =>
                    patch("defaultTaxPercent", Number(e.target.value) || 0)
                  }
                  disabled={isSaving}
                />
                <TextAreaField
                  label="Letterhead footer text"
                  name="footerText"
                  value={values.footerText}
                  rows={3}
                  onChange={(e) => patch("footerText", e.target.value)}
                  disabled={isSaving}
                />
                <TextField
                  label="Signature placeholder label"
                  name="signatureLabel"
                  value={values.signatureLabel}
                  onChange={(e) => patch("signatureLabel", e.target.value)}
                  hint="Shown above the signature line. External hardware-key signing comes later."
                  disabled={isSaving}
                />

                {error ? (
                  <p className="invoice-settings__error" role="alert">
                    {error}
                  </p>
                ) : null}
                {saved ? (
                  <p className="invoice-settings__success" role="status">
                    Settings saved.
                  </p>
                ) : null}

                <div className="invoice-settings__actions">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSaving}
                    onClick={() => navigate(APP_ROUTES.invoices)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save settings"}
                  </Button>
                </div>
              </div>
            </FormPanel>
          </form>
        )}
      </div>
    </AppScreenLayout>
  );
}
