import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { PasswordField } from "../../../components/PasswordField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import "./HrStaffForm.css";

export interface HrStaffFormValues {
  fullName: string;
  employeeCode: string;
  phone: string;
  email: string;
  password: string;
  notes: string;
}

export const EMPTY_HR_STAFF_FORM: HrStaffFormValues = {
  fullName: "",
  employeeCode: "",
  phone: "",
  email: "",
  password: "",
  notes: "",
};

export interface HrStaffFormProps {
  mode: "add" | "edit";
  initialValues?: Partial<HrStaffFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: HrStaffFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function HrStaffForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: HrStaffFormProps) {
  const [values, setValues] = useState<HrStaffFormValues>({
    ...EMPTY_HR_STAFF_FORM,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof HrStaffFormValues, string>>>({});

  function updateField<K extends keyof HrStaffFormValues>(
    field: K,
    value: HrStaffFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof HrStaffFormValues, string>> = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Enter the full name.";
    }

    if (!values.employeeCode.trim()) {
      nextErrors.employeeCode = "Enter an employee code.";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "Enter a phone number.";
    } else if (!/^[0-9+\-\s]{8,15}$/.test(values.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Enter an email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (mode === "add" && !values.password) {
      nextErrors.password = "Enter a password for this HR user.";
    } else if (values.password && values.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      ...values,
      fullName: values.fullName.trim(),
      employeeCode: values.employeeCode.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <form className="hr-staff-form" onSubmit={handleSubmit} noValidate>
      <FormPanel>
        <div className="form-panel__grid">
          <TextField
            label="Full name"
            name="fullName"
            value={values.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            errorMessage={errors.fullName}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Employee code"
            name="employeeCode"
            value={values.employeeCode}
            onChange={(e) => updateField("employeeCode", e.target.value)}
            errorMessage={errors.employeeCode}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            errorMessage={errors.phone}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            errorMessage={errors.email}
            required
            disabled={isSubmitting || mode === "edit"}
          />
        </div>

        <PasswordField
          label={
            mode === "add"
              ? "Password"
              : "New Password (optional)"
          }
          name="password"
          placeholder={
            mode === "add"
              ? "Set a login password"
              : "Leave blank to keep current password"
          }
          value={values.password}
          onChange={(e) => updateField("password", e.target.value)}
          errorMessage={errors.password}
          required={mode === "add"}
          disabled={isSubmitting}
        />

        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="HR responsibilities, team, or onboarding notes"
          disabled={isSubmitting}
        />

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
            {isSubmitting
              ? "Saving…"
              : mode === "add"
              ? "Add HR User"
              : "Save Changes"}
          </Button>
        </div>
      </FormPanel>
    </form>
  );
}
