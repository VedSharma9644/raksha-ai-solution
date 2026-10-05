import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { SelectField } from "../../../components/SelectField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import type { StaffMemberFormValues, StaffRole } from "../staffFormTypes";
import {
  EMPTY_STAFF_MEMBER_FORM,
  SAMPLE_SITE_OPTIONS,
} from "../staffFormTypes";
import "./StaffMemberForm.css";

const ROLE_COPY: Record<
  StaffRole,
  { submitLabel: string; siteLabel: string; siteRequired: boolean }
> = {
  guard: {
    submitLabel: "Save Guard",
    siteLabel: "Assigned site",
    siteRequired: true,
  },
  supervisor: {
    submitLabel: "Save Supervisor",
    siteLabel: "Primary site",
    siteRequired: true,
  },
  hr: {
    submitLabel: "Save HR User",
    siteLabel: "Office / region (optional)",
    siteRequired: false,
  },
};

export interface StaffMemberFormProps {
  role: StaffRole;
  initialValues?: StaffMemberFormValues;
  isSubmitting?: boolean;
  onSubmit: (values: StaffMemberFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function StaffMemberForm({
  role,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: StaffMemberFormProps) {
  const [values, setValues] = useState<StaffMemberFormValues>(
    initialValues ?? EMPTY_STAFF_MEMBER_FORM,
  );
  const [errors, setErrors] = useState<Partial<StaffMemberFormValues>>({});
  const roleCopy = ROLE_COPY[role];

  function updateField<K extends keyof StaffMemberFormValues>(
    field: K,
    value: StaffMemberFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<StaffMemberFormValues> = {};

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

    if (roleCopy.siteRequired && !values.assignedSiteId) {
      nextErrors.assignedSiteId = "Select a site.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

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
    <form className="staff-member-form" onSubmit={handleSubmit} noValidate>
      <FormPanel>
        <div className="form-panel__grid">
          <TextField
            label="Full name"
            name="fullName"
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            errorMessage={errors.fullName}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Employee code"
            name="employeeCode"
            value={values.employeeCode}
            onChange={(event) =>
              updateField("employeeCode", event.target.value)
            }
            errorMessage={errors.employeeCode}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            errorMessage={errors.phone}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            errorMessage={errors.email}
            required
            disabled={isSubmitting}
          />
        </div>

        <SelectField
          label={roleCopy.siteLabel}
          name="assignedSiteId"
          options={SAMPLE_SITE_OPTIONS}
          value={values.assignedSiteId}
          onChange={(event) =>
            updateField("assignedSiteId", event.target.value)
          }
          errorMessage={errors.assignedSiteId}
          required={roleCopy.siteRequired}
          disabled={isSubmitting}
        />

        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Shift preference, experience, or onboarding notes"
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
            {isSubmitting ? "Saving…" : roleCopy.submitLabel}
          </Button>
        </div>
      </FormPanel>
    </form>
  );
}
