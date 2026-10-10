import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { FormField, FormType } from "@raskha/form-builder";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { PasswordField } from "../../../components/PasswordField";
import { ProfilePictureField } from "../../../components/ProfilePictureField";
import { TextField } from "../../../components/TextField";
import { TextAreaField } from "../../../components/TextAreaField";
import { SelectField } from "../../../components/SelectField";
import { FileField } from "../../../components/FileField";
import { SiteLocationPicker } from "../../sites/SiteLocationPicker/SiteLocationPicker";
import type { SiteShiftRowValues } from "../../sites/siteFormTypes";
import { EMPTY_SHIFT_ROW } from "../../sites/siteFormTypes";
import "./FormBuilderForm.css";

/** ── Profile picture field renderer ────────────────────────────────────── */
function renderProfilePictureField(
  formData: Record<string, string | File | null>,
  disabled: boolean,
  handleFieldValue: (id: string, val: string | File | null) => void
) {
  return (
    <ProfilePictureField
      key="profilePicture"
      name={(formData["fullName"] as string) ?? ""}
      currentUrl={(formData["profilePictureUrl"] as string) ?? ""}
      disabled={disabled}
      onChange={(file) => handleFieldValue("profilePictureFile", file)}
    />
  );
}

/** ── Password field renderer (Password + Confirm Password) ─────────────── */
function renderPasswordField(
  field: FormField,
  formData: Record<string, string | File | null>,
  errors: Record<string, string>,
  disabled: boolean,
  handleFieldValue: (id: string, val: string | File | null) => void
) {
  return (
    <div key={field.id} className="fb-fill__password-group">
      <p className="fb-fill__section-label">{field.label}</p>
      <p className="fb-fill__section-hint">Set a password the guard will use to log into the Guard App.</p>
      <div className="form-panel__grid">
        <PasswordField
          label="Password"
          name="password"
          value={(formData["password"] as string) ?? ""}
          onChange={(e) => handleFieldValue("password", e.target.value)}
          errorMessage={errors["password"]}
          placeholder="Min. 8 characters"
          required={field.required}
          disabled={disabled}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          value={(formData["confirmPassword"] as string) ?? ""}
          onChange={(e) => handleFieldValue("confirmPassword", e.target.value)}
          errorMessage={errors["confirmPassword"]}
          placeholder="Re-enter password"
          required={field.required}
          disabled={disabled || !(formData["password"] as string)}
          autoComplete="new-password"
        />
      </div>
    </div>
  );
}

/** ── Location field renderer (SiteLocationPicker) ──────────────────────── */
function renderLocationField(
  formData: Record<string, string | File | null>,
  disabled: boolean,
  handleFieldValue: (id: string, val: string | File | null) => void
) {
  return (
    <div key="location" className="fb-fill__location-group">
      <SiteLocationPicker
        latitude={(formData["latitude"] as string) ?? ""}
        longitude={(formData["longitude"] as string) ?? ""}
        onLatChange={(val) => handleFieldValue("latitude", val)}
        onLngChange={(val) => handleFieldValue("longitude", val)}
        disabled={disabled}
      />
    </div>
  );
}

const SHIFT_TYPE_OPTIONS = [
  { value: "day",    label: "Day" },
  { value: "night",  label: "Night" },
  { value: "custom", label: "Custom" },
];

/** ── Shift configuration renderer ──────────────────────────────────────── */
function renderShiftConfigField(
  has24hSurveillance: boolean,
  intervalCheckinMinutes: string,
  shifts: SiteShiftRowValues[],
  shiftErrors: Record<string, string>,
  disabled: boolean,
  onToggle24h: (v: boolean) => void,
  onIntervalChange: (v: string) => void,
  onAddShift: () => void,
  onRemoveShift: (idx: number) => void,
  onUpdateShift: (idx: number, patch: Partial<SiteShiftRowValues>) => void
) {
  return (
    <div key="shiftConfig" style={{ gridColumn: "1 / -1" }}>
      <p className="add-site-form__section-label">Shift Configuration</p>
      <div className="shift-config">
        {/* 24h surveillance toggle */}
        <label className="shift-config__toggle-row">
          <input
            type="checkbox"
            className="shift-config__checkbox"
            checked={has24hSurveillance}
            onChange={(e) => onToggle24h(e.target.checked)}
            disabled={disabled}
          />
          <span className="shift-config__toggle-label">24-hour surveillance required</span>
        </label>

        {/* Interval check-in */}
        <div className="shift-config__interval-row">
          <label className="shift-config__interval-label" htmlFor="fb_intervalCheckinMinutes">
            Regular interval check-in every
          </label>
          <input
            id="fb_intervalCheckinMinutes"
            type="number"
            className="shift-config__interval-input"
            min={5}
            step={5}
            placeholder="–"
            value={intervalCheckinMinutes}
            onChange={(e) => onIntervalChange(e.target.value)}
            disabled={disabled}
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
            onClick={onAddShift}
            disabled={disabled}
          >
            + Add Shift
          </button>
        </div>

        {shifts.length === 0 && (
          <p className="shift-config__empty-hint">
            No shifts defined. Click "+ Add Shift" to add a Day or Night shift.
          </p>
        )}

        {shifts.map((shift, idx) => (
          <div key={shift.id} className="shift-config__shift-row">
            <div className="shift-config__shift-row-fields">
              <div className="shift-config__field shift-config__field--label">
                <label className="shift-config__field-label">Shift name</label>
                <input
                  type="text"
                  className={`shift-config__input${shiftErrors[`shift_label_${idx}`] ? " shift-config__input--error" : ""}`}
                  placeholder="e.g. Day Shift"
                  value={shift.label}
                  onChange={(e) => onUpdateShift(idx, { label: e.target.value })}
                  disabled={disabled}
                />
                {shiftErrors[`shift_label_${idx}`] && (
                  <span className="shift-config__field-error">{shiftErrors[`shift_label_${idx}`]}</span>
                )}
              </div>

              <div className="shift-config__field shift-config__field--type">
                <label className="shift-config__field-label">Type</label>
                <select
                  className="shift-config__select"
                  value={shift.shiftType}
                  onChange={(e) =>
                    onUpdateShift(idx, {
                      shiftType: e.target.value as SiteShiftRowValues["shiftType"],
                      startTime: e.target.value === "day" ? "06:00" : e.target.value === "night" ? "18:00" : shift.startTime,
                      endTime:   e.target.value === "day" ? "18:00" : e.target.value === "night" ? "06:00" : shift.endTime,
                    })
                  }
                  disabled={disabled}
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
                  className={`shift-config__input${shiftErrors[`shift_start_${idx}`] ? " shift-config__input--error" : ""}`}
                  value={shift.startTime}
                  onChange={(e) => onUpdateShift(idx, { startTime: e.target.value })}
                  disabled={disabled}
                />
              </div>

              <div className="shift-config__field shift-config__field--time">
                <label className="shift-config__field-label">End</label>
                <input
                  type="time"
                  className={`shift-config__input${shiftErrors[`shift_end_${idx}`] ? " shift-config__input--error" : ""}`}
                  value={shift.endTime}
                  onChange={(e) => onUpdateShift(idx, { endTime: e.target.value })}
                  disabled={disabled}
                />
              </div>

              <div className="shift-config__field shift-config__field--guards">
                <label className="shift-config__field-label">Guards needed</label>
                <div className="shift-config__gender-inputs">
                  <div className="shift-config__gender-group">
                    <span className="shift-config__gender-label">Male</span>
                    <input
                      type="number"
                      className={`shift-config__input${shiftErrors[`shift_guards_${idx}`] ? " shift-config__input--error" : ""}`}
                      min={0}
                      value={shift.requiredMale ?? "0"}
                      onChange={(e) => {
                        const male = e.target.value;
                        const total = (parseInt(male) || 0) + (parseInt(shift.requiredFemale ?? "0") || 0) + (parseInt(shift.requiredOther ?? "0") || 0);
                        onUpdateShift(idx, { requiredMale: male, requiredGuards: String(total || 0) });
                      }}
                      disabled={disabled}
                    />
                  </div>
                  <div className="shift-config__gender-group">
                    <span className="shift-config__gender-label">Female</span>
                    <input
                      type="number"
                      className="shift-config__input"
                      min={0}
                      value={shift.requiredFemale ?? "0"}
                      onChange={(e) => {
                        const female = e.target.value;
                        const total = (parseInt(shift.requiredMale ?? "0") || 0) + (parseInt(female) || 0) + (parseInt(shift.requiredOther ?? "0") || 0);
                        onUpdateShift(idx, { requiredFemale: female, requiredGuards: String(total || 0) });
                      }}
                      disabled={disabled}
                    />
                  </div>
                  <div className="shift-config__gender-group">
                    <span className="shift-config__gender-label">Other</span>
                    <input
                      type="number"
                      className="shift-config__input"
                      min={0}
                      value={shift.requiredOther ?? "0"}
                      onChange={(e) => {
                        const other = e.target.value;
                        const total = (parseInt(shift.requiredMale ?? "0") || 0) + (parseInt(shift.requiredFemale ?? "0") || 0) + (parseInt(other) || 0);
                        onUpdateShift(idx, { requiredOther: other, requiredGuards: String(total || 0) });
                      }}
                      disabled={disabled}
                    />
                  </div>
                  <div className="shift-config__gender-total">
                    <span className="shift-config__gender-label">Total</span>
                    <span className="shift-config__gender-total-value">{shift.requiredGuards || "0"}</span>
                  </div>
                </div>
                {shiftErrors[`shift_guards_${idx}`] && (
                  <span className="shift-config__field-error">{shiftErrors[`shift_guards_${idx}`]}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              className="shift-config__remove-btn"
              onClick={() => onRemoveShift(idx)}
              disabled={disabled}
              title="Remove shift"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderField(
  field: FormField,
  value: string | File | null,
  error: string | undefined,
  disabled: boolean,
  onChange: (val: string | File | null) => void
) {
  switch (field.type) {
    case "textarea":
      return (
        <TextAreaField
          key={field.id}
          label={field.label}
          name={field.id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          errorMessage={error}
          disabled={disabled}
        />
      );

    case "select":
      return (
        <SelectField
          key={field.id}
          label={field.label}
          name={field.id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          options={field.options ?? []}
          errorMessage={error}
          required={field.required}
          disabled={disabled}
        />
      );

    case "checkbox": {
      // value is comma-separated string of selected option values
      const checkedValues = value ? String(value).split(",").filter(Boolean) : [];
      return (
        <div key={field.id} style={{ gridColumn: "1 / -1" }}>
          <p className="fbf-group-label">
            {field.label}
            {field.required ? <span className="fbf-required">*</span> : null}
          </p>
          {error ? <p className="fbf-group-error">{error}</p> : null}
          <div className="fbf-check-group">
            {(field.options ?? []).map((opt) => (
              <label key={opt.value} className="fbf-check-item">
                <input
                  type="checkbox"
                  className="fbf-check-input"
                  disabled={disabled}
                  checked={checkedValues.includes(opt.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...checkedValues, opt.value]
                      : checkedValues.filter((v) => v !== opt.value);
                    onChange(next.join(","));
                  }}
                />
                <span className="fbf-check-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    case "radio": {
      const radioValue = (value as string) ?? "";
      return (
        <div key={field.id} style={{ gridColumn: "1 / -1" }}>
          <p className="fbf-group-label">
            {field.label}
            {field.required ? <span className="fbf-required">*</span> : null}
          </p>
          {error ? <p className="fbf-group-error">{error}</p> : null}
          <div className="fbf-check-group">
            {(field.options ?? []).map((opt) => (
              <label key={opt.value} className="fbf-check-item">
                <input
                  type="radio"
                  className="fbf-check-input"
                  name={field.id}
                  disabled={disabled}
                  checked={radioValue === opt.value}
                  onChange={() => onChange(opt.value)}
                />
                <span className="fbf-check-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    case "file":
      return (
        <FileField
          key={field.id}
          label={field.label}
          name={field.id}
          onChange={(file) => onChange(file)}
          errorMessage={error}
          required={field.required}
          disabled={disabled}
        />
      );

    default:
      return (
        <TextField
          key={field.id}
          label={field.label}
          name={field.id}
          type={
            field.type === "email"
              ? "email"
              : field.type === "phone"
                ? "tel"
                : field.type === "number"
                  ? "number"
                  : field.type === "date"
                    ? "date"
                    : "text"
          }
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          errorMessage={error}
          required={field.required}
          disabled={disabled}
        />
      );
  }
}

/** Fill-only custom form used on Add / Edit screens. */
export interface FormBuilderFormProps {
  formType: FormType;
  fields: FormField[];
  isSubmitting: boolean;
  initialValues?: Record<string, string | File | null>;
  submitLabel?: string;
  onSubmit: (data: Record<string, string | File | null>) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
}

export function FormBuilderForm({
  formType,
  fields,
  isSubmitting,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
  isDeleting = false,
}: FormBuilderFormProps) {
  const [formData, setFormData] = useState<Record<string, string | File | null>>(
    () => initialValues ?? {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Shift config state (only used when shiftConfig field is present) ─────
  const hasShiftConfig = fields.some((f) => f.type === "shiftConfig");
  const [has24hSurveillance, setHas24hSurveillance] = useState<boolean>(
    () => (initialValues?.["has24hSurveillance"] === true || initialValues?.["has24hSurveillance"] === "true") ?? false
  );
  const [intervalCheckinMinutes, setIntervalCheckinMinutes] = useState<string>(
    () => (initialValues?.["intervalCheckinMinutes"] as string) ?? ""
  );
  const [shifts, setShifts] = useState<SiteShiftRowValues[]>(
    () => (initialValues?.["shifts"] as unknown as SiteShiftRowValues[]) ?? []
  );
  const [shiftErrors, setShiftErrors] = useState<Record<string, string>>({});

  function addShift() {
    setShifts((prev) => [...prev, EMPTY_SHIFT_ROW()]);
  }
  function removeShift(idx: number) {
    setShifts((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateShift(idx: number, patch: Partial<SiteShiftRowValues>) {
    setShifts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
    setShiftErrors((prev) => {
      const next = { ...prev };
      delete next[`shift_label_${idx}`];
      delete next[`shift_start_${idx}`];
      delete next[`shift_end_${idx}`];
      delete next[`shift_guards_${idx}`];
      return next;
    });
  }

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
      setHas24hSurveillance(
        initialValues["has24hSurveillance"] === true || initialValues["has24hSurveillance"] === "true"
      );
      setIntervalCheckinMinutes((initialValues["intervalCheckinMinutes"] as string) ?? "");
      setShifts((initialValues["shifts"] as unknown as SiteShiftRowValues[]) ?? []);
    }
  }, [initialValues]);

  function handleFieldValue(fieldId: string, value: string | File | null) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: "" }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.type === "password") {
        const pw = (formData["password"] as string) ?? "";
        const confirm = (formData["confirmPassword"] as string) ?? "";
        if (field.required && !pw) {
          nextErrors["password"] = "Enter a password for the guard's login.";
        } else if (pw && pw.length < 8) {
          nextErrors["password"] = "Password must be at least 8 characters.";
        }
        if (pw && pw !== confirm) {
          nextErrors["confirmPassword"] = "Passwords do not match.";
        }
        continue;
      }
      if (field.type === "location") {
        if (field.required && !(formData["latitude"] as string)) {
          nextErrors["location"] = "Please select a location on the map.";
        }
        continue;
      }
      if (field.type === "shiftConfig") {
        // Validate individual shift rows
        const nextShiftErrors: Record<string, string> = {};
        shifts.forEach((s, i) => {
          if (!s.label.trim()) nextShiftErrors[`shift_label_${i}`] = "Enter shift name.";
          if (!s.startTime)    nextShiftErrors[`shift_start_${i}`] = "Set start time.";
          if (!s.endTime)      nextShiftErrors[`shift_end_${i}`]   = "Set end time.";
          const rg = parseInt(s.requiredGuards, 10);
          if (isNaN(rg) || rg < 1) nextShiftErrors[`shift_guards_${i}`] = "Min 1 guard.";
        });
        setShiftErrors(nextShiftErrors);
        if (Object.keys(nextShiftErrors).length > 0) {
          nextErrors["shiftConfig"] = "Fix shift errors above.";
        }
        continue;
      }
      if (field.required) {
        const val = formData[field.id];
        if (!val || (typeof val === "string" && !val.trim())) {
          nextErrors[field.id] = `${field.label} is required.`;
        }
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    // Merge shift config into submit payload when applicable
    const payload: Record<string, unknown> = { ...formData };
    if (hasShiftConfig) {
      payload["has24hSurveillance"] = has24hSurveillance;
      payload["intervalCheckinMinutes"] = intervalCheckinMinutes;
      payload["shifts"] = shifts;
    }
    await onSubmit(payload as Record<string, string | File | null>);
  }

  const defaultLabels: Record<FormType, string> = {
    guard: "Save guard",
    hr: "Save HR staff",
    site: "Save site",
  };

  return (
    <form className="fb-fill" onSubmit={handleSubmit} noValidate>
      <div className="fb-fill__intro">
        <p className="fb-eyebrow">Details</p>
        <h2 className="fb-fill__title">Complete the form</h2>
        <p className="fb-fill__hint">
          Fields are set in Form Builder. Enter the information below.
        </p>
      </div>

      <FormPanel>
        <div className="form-panel__grid">
          {fields.map((field) => {
            if (field.type === "profilePicture") {
              return renderProfilePictureField(formData, isSubmitting || isDeleting, handleFieldValue);
            }
            if (field.type === "password") {
              return renderPasswordField(field, formData, errors, isSubmitting || isDeleting, handleFieldValue);
            }
            if (field.type === "location") {
              return renderLocationField(formData, isSubmitting || isDeleting, handleFieldValue);
            }
            if (field.type === "shiftConfig") {
              return renderShiftConfigField(
                has24hSurveillance,
                intervalCheckinMinutes,
                shifts,
                shiftErrors,
                isSubmitting || isDeleting,
                setHas24hSurveillance,
                setIntervalCheckinMinutes,
                addShift,
                removeShift,
                updateShift
              );
            }
            return renderField(
              field,
              formData[field.id] ?? (field.type === "file" ? null : ""),
              errors[field.id],
              isSubmitting || isDeleting,
              (val) => handleFieldValue(field.id, val)
            );
          })}
        </div>

        <div className="form-panel__actions fb-fill__actions">
          {onDelete ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void onDelete()}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          ) : null}
          <div className="fb-fill__actions-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting
                ? "Saving…"
                : (submitLabel ?? defaultLabels[formType])}
            </Button>
          </div>
        </div>
      </FormPanel>
    </form>
  );
}
