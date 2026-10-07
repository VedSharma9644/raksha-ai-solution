import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { SelectField } from "../../../components/SelectField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import type { SiteFormValues } from "../siteFormTypes";
import { EMPTY_SITE_FORM, SITE_TYPE_OPTIONS } from "../siteFormTypes";
import { SiteLocationPicker } from "../SiteLocationPicker/SiteLocationPicker";
import "./AddSiteForm.css";

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
  const [values, setValues] = useState<SiteFormValues>(initialValues ?? EMPTY_SITE_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof SiteFormValues, string>>>({});

  function updateField<K extends keyof SiteFormValues>(
    field: K,
    value: SiteFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof SiteFormValues, string>> = {};

    if (!values.siteName.trim()) nextErrors.siteName = "Enter the site name.";
    if (!values.siteType) nextErrors.siteType = "Select a site type.";
    if (!values.clientName.trim()) nextErrors.clientName = "Enter the client name.";
    if (!values.address.trim()) nextErrors.address = "Enter the site address.";
    if (!values.city.trim()) nextErrors.city = "Enter the city.";
    if (!values.managerName.trim()) nextErrors.managerName = "Enter the manager name.";
    if (!values.managerContact.trim()) nextErrors.managerContact = "Enter the manager contact number.";

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
