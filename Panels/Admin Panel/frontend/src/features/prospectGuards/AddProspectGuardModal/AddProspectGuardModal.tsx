import { useEffect, useState } from "react";
import { TextField } from "../../../components/TextField";
import { SelectField } from "../../../components/SelectField";
import type { ProspectGuard } from "@raskha/guard-management";
import type { ProspectGuardFormValues } from "../prospectGuardFormTypes";
import {
  EMPTY_PROSPECT_GUARD_FORM,
  PROSPECT_GUARD_STATUS_OPTIONS,
  APPLICATION_SOURCE_OPTIONS,
  GENDER_OPTIONS,
  PHYSICAL_FITNESS_OPTIONS,
} from "../prospectGuardFormTypes";
import "./AddProspectGuardModal.css";

// ── Props ────────────────────────────────────────────────────────────────────

export interface AddProspectGuardModalProps {
  editGuard?: ProspectGuard | null;
  isSaving: boolean;
  saveError: string | null;
  onSave: (values: ProspectGuardFormValues) => void;
  onClose: () => void;
}

// ── Validation ───────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof ProspectGuardFormValues, string>>;

function validate(v: ProspectGuardFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.fullName.trim())  errors.fullName = "Full name is required.";
  if (!v.phone.trim())     errors.phone    = "Phone number is required.";
  if (v.yearsOfExperience && isNaN(Number(v.yearsOfExperience))) {
    errors.yearsOfExperience = "Must be a number.";
  }
  return errors;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function guardToFormValues(g: ProspectGuard): ProspectGuardFormValues {
  return {
    fullName: g.fullName,
    dateOfBirth: g.dateOfBirth ?? "",
    gender: g.gender,
    city: g.city,
    phone: g.phone,
    alternatePhone: g.alternatePhone,
    email: g.email,
    aadhaarNumber: g.aadhaarNumber,
    panNumber: g.panNumber,
    yearsOfExperience: g.yearsOfExperience != null ? String(g.yearsOfExperience) : "",
    previousEmployer: g.previousEmployer,
    height: g.height,
    weight: g.weight,
    physicalFitness: g.physicalFitness,
    interviewDate: g.interviewDate ?? "",
    interviewerName: g.interviewerName,
    applicationSource: g.applicationSource,
    status: g.status,
    followUpDate: g.followUpDate ?? "",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AddProspectGuardModal({
  editGuard,
  isSaving,
  saveError,
  onSave,
  onClose,
}: AddProspectGuardModalProps) {
  const [values, setValues] = useState<ProspectGuardFormValues>(
    editGuard ? guardToFormValues(editGuard) : EMPTY_PROSPECT_GUARD_FORM
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setValues(editGuard ? guardToFormValues(editGuard) : EMPTY_PROSPECT_GUARD_FORM);
    setErrors({});
  }, [editGuard]);

  function set<K extends keyof ProspectGuardFormValues>(key: K, val: ProspectGuardFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave(values);
  }

  const isEdit = !!editGuard;

  return (
    <div
      className="add-prospect-guard-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit prospect guard" : "Add prospect guard"}
    >
      <div className="add-prospect-guard-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="add-prospect-guard-modal__header">
          <h2 className="add-prospect-guard-modal__title">
            {isEdit ? "Edit Prospect Guard" : "Add Prospect Guard"}
          </h2>
          <button type="button" className="add-prospect-guard-modal__close" onClick={onClose}
            aria-label="Close modal">✕</button>
        </div>

        {/* Body */}
        <form className="add-prospect-guard-modal__body" onSubmit={handleSubmit} noValidate>

          {/* === Section: Personal === */}
          <p className="add-prospect-guard-modal__section-label">Personal Details</p>
          <div className="add-prospect-guard-modal__row">
            <TextField
              label="Full Name *"
              name="fullName"
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              errorMessage={errors.fullName}
              placeholder="e.g. Ramesh Kumar"
            />
            <SelectField
              label="Gender"
              name="gender"
              value={values.gender}
              onChange={(e) => set("gender", e.target.value)}
              options={GENDER_OPTIONS}
              placeholder="— Select —"
            />
          </div>
          <div className="add-prospect-guard-modal__row">
            <div className="add-prospect-guard-modal__field">
              <label className="add-prospect-guard-modal__date-label" htmlFor="dateOfBirth">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                className="add-prospect-guard-modal__date-input"
                value={values.dateOfBirth}
                onChange={(e) => set("dateOfBirth", e.target.value)}
              />
            </div>
            <TextField
              label="City"
              name="city"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Jaipur"
            />
          </div>

          {/* === Section: Contact === */}
          <p className="add-prospect-guard-modal__section-label">Contact</p>
          <div className="add-prospect-guard-modal__row">
            <TextField
              label="Phone *"
              name="phone"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              errorMessage={errors.phone}
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
            placeholder="e.g. ramesh@example.com"
            type="email"
          />

          {/* === Section: ID Documents === */}
          <p className="add-prospect-guard-modal__section-label">ID Documents</p>
          <div className="add-prospect-guard-modal__row">
            <TextField
              label="Aadhaar Number"
              name="aadhaarNumber"
              value={values.aadhaarNumber}
              onChange={(e) => set("aadhaarNumber", e.target.value)}
              placeholder="12-digit Aadhaar"
            />
            <TextField
              label="PAN Number"
              name="panNumber"
              value={values.panNumber}
              onChange={(e) => set("panNumber", e.target.value)}
              placeholder="e.g. ABCDE1234F"
            />
          </div>

          {/* === Section: Experience & Physical === */}
          <p className="add-prospect-guard-modal__section-label">Experience & Physical</p>
          <div className="add-prospect-guard-modal__row">
            <TextField
              label="Years of Experience"
              name="yearsOfExperience"
              value={values.yearsOfExperience}
              onChange={(e) => set("yearsOfExperience", e.target.value)}
              errorMessage={errors.yearsOfExperience}
              placeholder="e.g. 3"
              type="number"
              min="0"
            />
            <TextField
              label="Previous Employer"
              name="previousEmployer"
              value={values.previousEmployer}
              onChange={(e) => set("previousEmployer", e.target.value)}
              placeholder="e.g. G4S Security"
            />
          </div>
          <div className="add-prospect-guard-modal__row add-prospect-guard-modal__row--three">
            <TextField
              label="Height (cm)"
              name="height"
              value={values.height}
              onChange={(e) => set("height", e.target.value)}
              placeholder="e.g. 175"
            />
            <TextField
              label="Weight (kg)"
              name="weight"
              value={values.weight}
              onChange={(e) => set("weight", e.target.value)}
              placeholder="e.g. 72"
            />
            <SelectField
              label="Physical Fitness"
              name="physicalFitness"
              value={values.physicalFitness}
              onChange={(e) => set("physicalFitness", e.target.value)}
              options={PHYSICAL_FITNESS_OPTIONS}
              placeholder="— Select —"
            />
          </div>

          {/* === Section: Interview === */}
          <p className="add-prospect-guard-modal__section-label">Interview</p>
          <div className="add-prospect-guard-modal__row">
            <div className="add-prospect-guard-modal__field">
              <label className="add-prospect-guard-modal__date-label" htmlFor="interviewDate">
                Interview Date
              </label>
              <input
                id="interviewDate"
                type="date"
                className="add-prospect-guard-modal__date-input"
                value={values.interviewDate}
                onChange={(e) => set("interviewDate", e.target.value)}
              />
            </div>
            <TextField
              label="Interviewer Name"
              name="interviewerName"
              value={values.interviewerName}
              onChange={(e) => set("interviewerName", e.target.value)}
              placeholder="e.g. HR Priya"
            />
          </div>

          {/* === Section: Pipeline === */}
          <p className="add-prospect-guard-modal__section-label">Pipeline</p>
          <div className="add-prospect-guard-modal__row">
            <SelectField
              label="Status"
              name="status"
              value={values.status}
              onChange={(e) => set("status", e.target.value as ProspectGuardFormValues["status"])}
              options={PROSPECT_GUARD_STATUS_OPTIONS}
            />
            <SelectField
              label="Application Source"
              name="applicationSource"
              value={values.applicationSource}
              onChange={(e) => set("applicationSource", e.target.value)}
              options={APPLICATION_SOURCE_OPTIONS}
            />
          </div>
          <div className="add-prospect-guard-modal__row">
            <div className="add-prospect-guard-modal__field">
              <label className="add-prospect-guard-modal__date-label" htmlFor="followUpDate">
                Follow-up Date
              </label>
              <input
                id="followUpDate"
                type="date"
                className="add-prospect-guard-modal__date-input"
                value={values.followUpDate}
                onChange={(e) => set("followUpDate", e.target.value)}
              />
            </div>
          </div>

          {/* Save error */}
          {saveError && <p className="add-prospect-guard-modal__save-error">{saveError}</p>}

          {/* Footer */}
          <div className="add-prospect-guard-modal__footer">
            <button
              type="button"
              className="add-prospect-guard-modal__cancel-btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-prospect-guard-modal__save-btn"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Add Prospect Guard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
