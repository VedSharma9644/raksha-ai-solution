import { useEffect, useState } from "react";
import { TextField } from "../../../components/TextField";
import { SelectField } from "../../../components/SelectField";
import type { ProspectClient } from "@raskha/client-management";
import type { ProspectFormValues } from "../prospectFormTypes";
import {
  EMPTY_PROSPECT_FORM,
  PROSPECT_STATUS_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  EXPECTED_SITE_TYPE_OPTIONS,
} from "../prospectFormTypes";
import "./AddProspectModal.css";

// ── Props ────────────────────────────────────────────────────────────────────

export interface AddProspectModalProps {
  /** Populated when editing an existing prospect; undefined for new */
  editProspect?: ProspectClient | null;
  isSaving: boolean;
  saveError: string;
  onSave: (values: ProspectFormValues) => void;
  onClose: () => void;
}

// ── Validation ───────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof ProspectFormValues, string>>;

function validate(v: ProspectFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.orgName.trim())      errors.orgName      = "Organisation name is required.";
  if (!v.contactName.trim())  errors.contactName  = "Contact person name is required.";
  if (!v.primaryPhone.trim()) errors.primaryPhone = "Primary phone is required.";
  if (v.expectedGuardCount && isNaN(Number(v.expectedGuardCount))) {
    errors.expectedGuardCount = "Must be a number.";
  }
  return errors;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function prospectToFormValues(p: ProspectClient): ProspectFormValues {
  return {
    orgName: p.orgName,
    city: p.city,
    expectedSiteType: p.expectedSiteType,
    expectedGuardCount: p.expectedGuardCount != null ? String(p.expectedGuardCount) : "",
    expectedMonthlyValue: p.expectedMonthlyValue,
    leadSource: p.leadSource,
    contactName: p.contactName,
    contactDesignation: p.contactDesignation,
    primaryPhone: p.primaryPhone,
    alternatePhone: p.alternatePhone,
    email: p.email,
    status: p.status,
    followUpDate: p.followUpDate ?? "",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AddProspectModal({
  editProspect,
  isSaving,
  saveError,
  onSave,
  onClose,
}: AddProspectModalProps) {
  const [values, setValues] = useState<ProspectFormValues>(
    editProspect ? prospectToFormValues(editProspect) : EMPTY_PROSPECT_FORM
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  // Re-initialise when switching from add→edit or edit→add
  useEffect(() => {
    setValues(editProspect ? prospectToFormValues(editProspect) : EMPTY_PROSPECT_FORM);
    setErrors({});
  }, [editProspect]);

  function set<K extends keyof ProspectFormValues>(key: K, val: ProspectFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(values);
  }

  const isEdit = !!editProspect;

  return (
    <div className="add-prospect-modal__backdrop" onClick={onClose} role="dialog" aria-modal="true"
      aria-label={isEdit ? "Edit prospect" : "Add new prospect"}>
      <div className="add-prospect-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="add-prospect-modal__header">
          <h2 className="add-prospect-modal__title">
            {isEdit ? "Edit Prospect" : "Add New Prospect"}
          </h2>
          <button type="button" className="add-prospect-modal__close" onClick={onClose}
            aria-label="Close modal">✕</button>
        </div>

        {/* Body */}
        <form className="add-prospect-modal__body" onSubmit={handleSubmit} noValidate>

          {/* === Section: Organisation === */}
          <p className="add-prospect-modal__section-label">Organisation</p>
          <div className="add-prospect-modal__row">
            <TextField
              label="Organisation / Company Name *"
              name="orgName"
              value={values.orgName}
              onChange={(e) => set("orgName", e.target.value)}
              errorMessage={errors.orgName}
              placeholder="e.g. City Mall Pvt Ltd"
            />
            <TextField
              label="City"
              name="city"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Jaipur"
            />
          </div>
          <div className="add-prospect-modal__row">
            <SelectField
              label="Expected Site Type"
              name="expectedSiteType"
              value={values.expectedSiteType}
              onChange={(e) => set("expectedSiteType", e.target.value)}
              options={EXPECTED_SITE_TYPE_OPTIONS}
              placeholder="— Select —"
            />
            <TextField
              label="Expected Guards Required"
              name="expectedGuardCount"
              value={values.expectedGuardCount}
              onChange={(e) => set("expectedGuardCount", e.target.value)}
              errorMessage={errors.expectedGuardCount}
              placeholder="e.g. 10"
              type="number"
              min="0"
            />
          </div>
          <div className="add-prospect-modal__row">
            <TextField
              label="Expected Monthly Value (₹)"
              name="expectedMonthlyValue"
              value={values.expectedMonthlyValue}
              onChange={(e) => set("expectedMonthlyValue", e.target.value)}
              placeholder="e.g. 75000"
            />
            <SelectField
              label="Lead Source"
              name="leadSource"
              value={values.leadSource}
              onChange={(e) => set("leadSource", e.target.value)}
              options={LEAD_SOURCE_OPTIONS}
            />
          </div>

          {/* === Section: Contact === */}
          <p className="add-prospect-modal__section-label">Contact Person</p>
          <div className="add-prospect-modal__row">
            <TextField
              label="Contact Name *"
              name="contactName"
              value={values.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              errorMessage={errors.contactName}
              placeholder="e.g. Ramesh Sharma"
            />
            <TextField
              label="Designation"
              name="contactDesignation"
              value={values.contactDesignation}
              onChange={(e) => set("contactDesignation", e.target.value)}
              placeholder="e.g. Security Manager"
            />
          </div>
          <div className="add-prospect-modal__row">
            <TextField
              label="Primary Phone *"
              name="primaryPhone"
              value={values.primaryPhone}
              onChange={(e) => set("primaryPhone", e.target.value)}
              errorMessage={errors.primaryPhone}
              placeholder="e.g. 9876543210"
              type="tel"
            />
            <TextField
              label="Alternate Phone"
              name="alternatePhone"
              value={values.alternatePhone}
              onChange={(e) => set("alternatePhone", e.target.value)}
              placeholder="e.g. 9876543211"
              type="tel"
            />
          </div>
          <TextField
            label="Email"
            name="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="e.g. contact@citymall.in"
            type="email"
          />

          {/* === Section: Lead === */}
          <p className="add-prospect-modal__section-label">Lead Status</p>
          <div className="add-prospect-modal__row">
            <SelectField
              label="Status"
              name="status"
              value={values.status}
              onChange={(e) => set("status", e.target.value as ProspectFormValues["status"])}
              options={PROSPECT_STATUS_OPTIONS}
              placeholder="— Select —"
            />
            <div className="add-prospect-modal__field">
              <label className="add-prospect-modal__date-label" htmlFor="followUpDate">
                Next Follow-up Date
              </label>
              <input
                id="followUpDate"
                type="date"
                className="add-prospect-modal__date-input"
                value={values.followUpDate}
                onChange={(e) => set("followUpDate", e.target.value)}
              />
            </div>
          </div>

          {/* Save error */}
          {saveError && <p className="add-prospect-modal__save-error">{saveError}</p>}

          {/* Footer */}
          <div className="add-prospect-modal__footer">
            <button
              type="button"
              className="add-prospect-modal__cancel-btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-prospect-modal__save-btn"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Add Prospect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
