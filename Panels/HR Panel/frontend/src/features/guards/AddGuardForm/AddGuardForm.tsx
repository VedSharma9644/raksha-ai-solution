import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import type { GuardFormValues } from "../guardTypes";
import { EMPTY_GUARD_FORM } from "../guardTypes";
import "./AddGuardForm.css";

export interface AddGuardFormProps {
  isSubmitting?: boolean;
  onSubmit: (values: GuardFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function AddGuardForm({
  isSubmitting = false,
  onSubmit,
  onCancel,
}: AddGuardFormProps) {
  const [values, setValues] = useState<GuardFormValues>(EMPTY_GUARD_FORM);
  const [errors, setErrors] = useState<Partial<GuardFormValues>>({});

  function updateField<K extends keyof GuardFormValues>(
    field: K,
    value: GuardFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<GuardFormValues> = {};

    if (!values.fullName.trim()) nextErrors.fullName = "Enter the full name.";
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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      fullName: values.fullName.trim(),
      employeeCode: values.employeeCode.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <form className="add-guard-form" onSubmit={handleSubmit} noValidate>
      <FormPanel>
        <p className="add-guard-form__note">
          Site assignment is handled by the Agency Panel. HR can create the
          guard profile only.
        </p>

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

        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Experience, shift preference, onboarding notes"
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
            {isSubmitting ? "Saving…" : "Save Guard"}
          </Button>
        </div>
      </FormPanel>
    </form>
  );
}
