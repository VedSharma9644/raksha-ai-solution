import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import type { SiteFormValues } from "../siteFormTypes";
import { EMPTY_SITE_FORM } from "../siteFormTypes";
import "./AddSiteForm.css";

export interface AddSiteFormProps {
  isSubmitting?: boolean;
  onSubmit: (values: SiteFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function AddSiteForm({
  isSubmitting = false,
  onSubmit,
  onCancel,
}: AddSiteFormProps) {
  const [values, setValues] = useState<SiteFormValues>(EMPTY_SITE_FORM);
  const [errors, setErrors] = useState<Partial<SiteFormValues>>({});

  function updateField<K extends keyof SiteFormValues>(
    field: K,
    value: SiteFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<SiteFormValues> = {};

    if (!values.siteName.trim()) {
      nextErrors.siteName = "Enter the site name.";
    }

    if (!values.clientName.trim()) {
      nextErrors.clientName = "Enter the client name.";
    }

    if (!values.address.trim()) {
      nextErrors.address = "Enter the site address.";
    }

    if (!values.city.trim()) {
      nextErrors.city = "Enter the city.";
    }

    if (!values.contactPerson.trim()) {
      nextErrors.contactPerson = "Enter a site contact person.";
    }

    if (!values.contactPhone.trim()) {
      nextErrors.contactPhone = "Enter a contact phone number.";
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
      siteName: values.siteName.trim(),
      clientName: values.clientName.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      contactPerson: values.contactPerson.trim(),
      contactPhone: values.contactPhone.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <form className="add-site-form" onSubmit={handleSubmit} noValidate>
      <FormPanel>
        <div className="form-panel__grid">
          <TextField
            label="Site name"
            name="siteName"
            value={values.siteName}
            onChange={(event) => updateField("siteName", event.target.value)}
            errorMessage={errors.siteName}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Client name"
            name="clientName"
            value={values.clientName}
            onChange={(event) => updateField("clientName", event.target.value)}
            errorMessage={errors.clientName}
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
        </div>

        <TextField
          label="Contact phone"
          name="contactPhone"
          type="tel"
          value={values.contactPhone}
          onChange={(event) => updateField("contactPhone", event.target.value)}
          errorMessage={errors.contactPhone}
          required
          disabled={isSubmitting}
        />

        <TextAreaField
          label="Address"
          name="address"
          value={values.address}
          onChange={(event) => updateField("address", event.target.value)}
          errorMessage={errors.address}
          required
          disabled={isSubmitting}
        />

        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Gates, patrol zones, access instructions"
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
            {isSubmitting ? "Saving…" : "Save Site"}
          </Button>
        </div>
      </FormPanel>
    </form>
  );
}
