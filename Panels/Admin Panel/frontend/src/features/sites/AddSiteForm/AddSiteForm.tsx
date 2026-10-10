import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { SelectField } from "../../../components/SelectField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import type { SiteFormValues, SiteShiftRowValues } from "../siteFormTypes";
import { EMPTY_SITE_FORM, EMPTY_SHIFT_ROW, SITE_TYPE_OPTIONS } from "../siteFormTypes";
import { SiteLocationPicker } from "../SiteLocationPicker/SiteLocationPicker";
import { useBranchContext } from "../../branches";
import "./AddSiteForm.css";

const SHIFT_TYPE_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" },
  { value: "custom", label: "Custom" },
];

export interface AddSiteFormProps {
  isSubmitting?: boolean;
  initialValues?: SiteFormValues;
  onSubmit: (values: SiteFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function AddSiteForm({
  isSubmitting = false,
  initialValues,
  onSubmit,
  onCancel,
}: AddSiteFormProps) {
  const { branches } = useBranchContext();
  const [values, setValues] = useState<SiteFormValues>(initialValues ?? EMPTY_SITE_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  function updateField<K extends keyof SiteFormValues>(
    field: K,
    value: SiteFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  // ── Shift row helpers ──────────────────────────────────────────────────────
  function addShift() {
    setValues((v) => ({ ...v, shifts: [...v.shifts, EMPTY_SHIFT_ROW()] }));
  }

  function removeShift(idx: number) {
    setValues((v) => ({ ...v, shifts: v.shifts.filter((_, i) => i !== idx) }));
  }

  function updateShift(idx: number, patch: Partial<SiteShiftRowValues>) {
    setValues((v) => {
      const next = [...v.shifts];
      next[idx] = { ...next[idx], ...patch };
      return { ...v, shifts: next };
    });
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<string, string>> = {};

    if (!values.siteName.trim()) nextErrors.siteName = "Enter the site name.";
    if (!values.siteType) nextErrors.siteType = "Select a site type.";
    if (!values.clientName.trim()) nextErrors.clientName = "Enter the client name.";
    if (!values.address.trim()) nextErrors.address = "Enter the site address.";
    if (!values.city.trim()) nextErrors.city = "Enter the city.";
    if (!values.managerName.trim()) nextErrors.managerName = "Enter the manager name.";
    if (!values.managerContact.trim()) nextErrors.managerContact = "Enter the manager contact number.";

    // Validate shift rows
    values.shifts.forEach((s, i) => {
      if (!s.label.trim()) nextErrors[`shift_label_${i}`] = "Enter shift name.";
      if (!s.startTime) nextErrors[`shift_start_${i}`] = "Set start time.";
      if (!s.endTime) nextErrors[`shift_end_${i}`] = "Set end time.";
      const rg = parseInt(s.requiredGuards, 10);
      if (isNaN(rg) || rg < 1) nextErrors[`shift_guards_${i}`] = "Min 1 guard total.";
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      ...values,
      siteName: values.siteName.trim(),
      clientName: values.clientName.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      managerName: values.managerName.trim(),
      managerContact: values.managerContact.trim(),
      hrName: values.hrName.trim(),
      hrContact: values.hrContact.trim(),
      siteSupervisor: values.siteSupervisor.trim(),
      contactPerson: values.contactPerson.trim(),
      contactPhone: values.contactPhone.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <form className="add-site-form" onSubmit={handleSubmit} noValidate>
      <FormPanel>

        {/* ── Site Details ── */}
        <p className="add-site-form__section-label">Site Details</p>
        <div className="form-panel__grid">
          <TextField
            label="Site name"
            name="siteName"
            value={values.siteName}
            onChange={(e) => updateField("siteName", e.target.value)}
            errorMessage={errors.siteName}
            required
            disabled={isSubmitting}
          />
          <SelectField
            label="Site type"
            name="siteType"
            options={SITE_TYPE_OPTIONS}
            placeholder="Select site type"
            value={values.siteType}
            onChange={(e) =>
              updateField("siteType", e.target.value as SiteFormValues["siteType"])
            }
            errorMessage={errors.siteType}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Client name"
            name="clientName"
            value={values.clientName}
            onChange={(e) => updateField("clientName", e.target.value)}
            errorMessage={errors.clientName}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="City"
            name="city"
            value={values.city}
            onChange={(e) => updateField("city", e.target.value)}
            errorMessage={errors.city}
            required
            disabled={isSubmitting}
          />
        </div>

        <TextAreaField
          label="Address"
          name="address"
          value={values.address}
          onChange={(e) => updateField("address", e.target.value)}
          errorMessage={errors.address}
          required
          disabled={isSubmitting}
        />

        {/* ── Section: Location ── */}
        <p className="add-site-form__section-label">Location</p>
        <SiteLocationPicker
          latitude={values.latitude}
          longitude={values.longitude}
          onLatChange={(val) => updateField("latitude", val)}
          onLngChange={(val) => updateField("longitude", val)}
          disabled={isSubmitting}
        />

        {/* ── Manager Details ── */}
        <p className="add-site-form__section-label">Manager Details</p>
        <div className="form-panel__grid">
          <TextField
            label="Manager name"
            name="managerName"
            value={values.managerName}
            onChange={(e) => updateField("managerName", e.target.value)}
            errorMessage={errors.managerName}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Manager contact"
            name="managerContact"
            type="tel"
            value={values.managerContact}
            onChange={(e) => updateField("managerContact", e.target.value)}
            errorMessage={errors.managerContact}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* ── HR Details ── */}
        <p className="add-site-form__section-label">HR Details</p>
        <div className="form-panel__grid">
          <TextField
            label="HR name"
            name="hrName"
            value={values.hrName}
            onChange={(e) => updateField("hrName", e.target.value)}
            errorMessage={errors.hrName}
            disabled={isSubmitting}
          />
          <TextField
            label="HR contact"
            name="hrContact"
            type="tel"
            value={values.hrContact}
            onChange={(e) => updateField("hrContact", e.target.value)}
            errorMessage={errors.hrContact}
            disabled={isSubmitting}
          />
        </div>

        {/* ── Site Supervisor ── */}
        <p className="add-site-form__section-label">Site Supervisor</p>
        <div className="form-panel__grid">
          <TextField
            label="Site supervisor name"
            name="siteSupervisor"
            value={values.siteSupervisor}
            onChange={(e) => updateField("siteSupervisor", e.target.value)}
            errorMessage={errors.siteSupervisor}
            disabled={isSubmitting}
          />
        </div>

        {/* ── Notes ── */}
        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Gates, patrol zones, access instructions"
          disabled={isSubmitting}
        />

        {/* ── Branch Assignment ── */}
        {branches.length > 0 && (
          <>
            <p className="add-site-form__section-label">Branch Assignment</p>
            <div className="form-panel__grid">
              <SelectField
                label="Assigned branch"
                name="branchId"
                value={values.branchId}
                onChange={(e) => updateField("branchId", e.target.value)}
                options={branches.map((b) => ({
                  value: b.id,
                  label: b.city ? `${b.name} — ${b.city}` : b.name,
                }))}
                placeholder="No branch (unassigned)"
                disabled={isSubmitting}
              />
            </div>
          </>
        )}

        {/* ── Shift Configuration ── */}
        <p className="add-site-form__section-label">Shift Configuration</p>
        <div className="shift-config">
          {/* 24h surveillance toggle */}
          <label className="shift-config__toggle-row">
            <input
              type="checkbox"
              className="shift-config__checkbox"
              checked={values.has24hSurveillance}
              onChange={(e) => updateField("has24hSurveillance", e.target.checked)}
              disabled={isSubmitting}
            />
            <span className="shift-config__toggle-label">24-hour surveillance required</span>
          </label>

          {/* Interval check-in */}
          <div className="shift-config__interval-row">
            <label className="shift-config__interval-label" htmlFor="intervalCheckinMinutes">
              Regular interval check-in every
            </label>
            <input
              id="intervalCheckinMinutes"
              type="number"
              className="shift-config__interval-input"
              min={5}
              step={5}
              placeholder="–"
              value={values.intervalCheckinMinutes}
              onChange={(e) => updateField("intervalCheckinMinutes", e.target.value)}
              disabled={isSubmitting}
            />
            <span className="shift-config__interval-unit">minutes</span>
            <span className="shift-config__interval-hint">(leave blank to disable)</span>
          </div>

          {/* Shift list */}
          <div className="shift-config__shifts-header">
            <span className="shift-config__shifts-title">Shift Slots</span>
            <button
              type="button"
              className="shift-config__add-btn"
              onClick={addShift}
              disabled={isSubmitting}
            >
              + Add Shift
            </button>
          </div>

          {values.shifts.length === 0 && (
            <p className="shift-config__empty-hint">
              No shifts defined. Click "+ Add Shift" to add a Day or Night shift.
            </p>
          )}

          {values.shifts.map((shift, idx) => (
            <div key={shift.id} className="shift-config__shift-row">
              <div className="shift-config__shift-row-fields">
                <div className="shift-config__field shift-config__field--label">
                  <label className="shift-config__field-label">Shift name</label>
                  <input
                    type="text"
                    className={`shift-config__input${errors[`shift_label_${idx}`] ? " shift-config__input--error" : ""}`}
                    placeholder="e.g. Day Shift"
                    value={shift.label}
                    onChange={(e) => updateShift(idx, { label: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors[`shift_label_${idx}`] && (
                    <span className="shift-config__field-error">{errors[`shift_label_${idx}`]}</span>
                  )}
                </div>

                <div className="shift-config__field shift-config__field--type">
                  <label className="shift-config__field-label">Type</label>
                  <select
                    className="shift-config__select"
                    value={shift.shiftType}
                    onChange={(e) =>
                      updateShift(idx, {
                        shiftType: e.target.value as SiteShiftRowValues["shiftType"],
                        startTime: e.target.value === "day" ? "06:00" : e.target.value === "night" ? "18:00" : shift.startTime,
                        endTime: e.target.value === "day" ? "18:00" : e.target.value === "night" ? "06:00" : shift.endTime,
                      })
                    }
                    disabled={isSubmitting}
                  >
                    {SHIFT_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="shift-config__field shift-config__field--time">
                  <label className="shift-config__field-label">Start</label>
                  <input
                    type="time"
                    className={`shift-config__input${errors[`shift_start_${idx}`] ? " shift-config__input--error" : ""}`}
                    value={shift.startTime}
                    onChange={(e) => updateShift(idx, { startTime: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="shift-config__field shift-config__field--time">
                  <label className="shift-config__field-label">End</label>
                  <input
                    type="time"
                    className={`shift-config__input${errors[`shift_end_${idx}`] ? " shift-config__input--error" : ""}`}
                    value={shift.endTime}
                    onChange={(e) => updateShift(idx, { endTime: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="shift-config__field shift-config__field--guards">
                  <label className="shift-config__field-label">Guards needed</label>
                  <div className="shift-config__gender-inputs">
                    <div className="shift-config__gender-group">
                      <span className="shift-config__gender-label">Male</span>
                      <input
                        type="number"
                        className={`shift-config__input${errors[`shift_guards_${idx}`] ? " shift-config__input--error" : ""}`}
                        min={0}
                        value={shift.requiredMale}
                        onChange={(e) => {
                          const male = e.target.value;
                          const total = (parseInt(male) || 0) + (parseInt(shift.requiredFemale) || 0) + (parseInt(shift.requiredOther) || 0);
                          updateShift(idx, { requiredMale: male, requiredGuards: String(total || 0) });
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="shift-config__gender-group">
                      <span className="shift-config__gender-label">Female</span>
                      <input
                        type="number"
                        className="shift-config__input"
                        min={0}
                        value={shift.requiredFemale}
                        onChange={(e) => {
                          const female = e.target.value;
                          const total = (parseInt(shift.requiredMale) || 0) + (parseInt(female) || 0) + (parseInt(shift.requiredOther) || 0);
                          updateShift(idx, { requiredFemale: female, requiredGuards: String(total || 0) });
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="shift-config__gender-group">
                      <span className="shift-config__gender-label">Other</span>
                      <input
                        type="number"
                        className="shift-config__input"
                        min={0}
                        value={shift.requiredOther}
                        onChange={(e) => {
                          const other = e.target.value;
                          const total = (parseInt(shift.requiredMale) || 0) + (parseInt(shift.requiredFemale) || 0) + (parseInt(other) || 0);
                          updateShift(idx, { requiredOther: other, requiredGuards: String(total || 0) });
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="shift-config__gender-total">
                      <span className="shift-config__gender-label">Total</span>
                      <span className="shift-config__gender-total-value">{shift.requiredGuards || "0"}</span>
                    </div>
                  </div>
                  {errors[`shift_guards_${idx}`] && (
                    <span className="shift-config__field-error">{errors[`shift_guards_${idx}`]}</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="shift-config__remove-btn"
                onClick={() => removeShift(idx)}
                disabled={isSubmitting}
                title="Remove shift"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="form-panel__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save Site"}
          </Button>
        </div>
      </FormPanel>
    </form>
  );
}
