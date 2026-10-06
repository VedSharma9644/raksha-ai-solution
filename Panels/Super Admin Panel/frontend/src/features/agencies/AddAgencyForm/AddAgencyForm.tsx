import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { SelectField } from "../../../components/SelectField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import type { AgencyFormValues } from "../agencyTypes";
import { EMPTY_AGENCY_FORM, SAMPLE_PLAN_OPTIONS } from "../agencyTypes";
import "./AddAgencyForm.css";

export interface AddAgencyFormProps {
  isSubmitting?: boolean;
  /** When true, password is required (create). When false, blank keeps current. */
  requirePassword?: boolean;
  initialValues?: AgencyFormValues;
  submitLabel?: string;
  formError?: string;
  onSubmit: (values: AgencyFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function AddAgencyForm({
  isSubmitting = false,
  requirePassword = true,
  initialValues = EMPTY_AGENCY_FORM,
  submitLabel = "Save Agency",
  formError = "",
  onSubmit,
  onCancel,
}: AddAgencyFormProps) {
  const [values, setValues] = useState<AgencyFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<AgencyFormValues>>({});

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function updateField<K extends keyof AgencyFormValues>(
    field: K,
    value: AgencyFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<AgencyFormValues> = {};

    if (!values.agencyName.trim()) nextErrors.agencyName = "Enter the agency name.";
    if (!values.contactPerson.trim()) {
      nextErrors.contactPerson = "Enter a contact person.";
    }
    if (!values.email.trim()) {
      nextErrors.email = "Enter an email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!values.phone.trim()) nextErrors.phone = "Enter a phone number.";
    if (!values.city.trim()) nextErrors.city = "Enter the city.";
    if (!values.planId) nextErrors.planId = "Select a plan.";
    if (requirePassword) {
      if (!values.password.trim()) {
        nextErrors.password = "Set an initial login password.";
      } else if (values.password.trim().length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }
    } else if (
      values.password.trim() &&
      values.password.trim().length < 8
    ) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      agencyName: values.agencyName.trim(),
      contactPerson: values.contactPerson.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      city: values.city.trim(),
      planId: values.planId,
      notes: values.notes.trim(),
      password: values.password,
    });
  }

  return (
    <form className="add-agency-form" onSubmit={handleSubmit} noValidate>
      <FormPanel>
        <div className="form-panel__grid">
          <TextField
            label="Agency name"
            name="agencyName"
            value={values.agencyName}
            onChange={(event) => updateField("agencyName", event.target.value)}
            errorMessage={errors.agencyName}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Contact person"
            name="contactPerson"
            value={values.contactPerson}
            onChange={(event) =>
              updateField("contactPerson", event.target.value)
            }
            errorMessage={errors.contactPerson}
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
            label="City"
            name="city"
            value={values.city}
            onChange={(event) => updateField("city", event.target.value)}
            errorMessage={errors.city}
            required
            disabled={isSubmitting}
          />
          <SelectField
            label="Starting plan"
            name="planId"
            options={SAMPLE_PLAN_OPTIONS}
            value={values.planId}
            onChange={(event) => updateField("planId", event.target.value)}
            errorMessage={errors.planId}
            required
            disabled={isSubmitting}
          />
          <TextField
            label={requirePassword ? "Login password" : "New password (optional)"}
            name="password"
            type="password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            errorMessage={errors.password}
            required={requirePassword}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </div>

        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Onboarding notes, region, or special terms"
          disabled={isSubmitting}
        />

        {formError ? (
          <p className="add-agency-form__error" role="alert">
            {formError}
          </p>
        ) : null}

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
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </FormPanel>
    </form>
  );
}
