import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { FileField } from "../../../components/FileField";
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
  const [errors, setErrors] = useState<Partial<Record<keyof StaffMemberFormValues, string>>>({});
  const roleCopy = ROLE_COPY[role];

  function updateField<K extends keyof StaffMemberFormValues>(
    field: K,
    value: StaffMemberFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof StaffMemberFormValues, string>> = {};

    if (!values.fullName.trim()) nextErrors.fullName = "Enter the full name.";
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
    if (!values.employeeCode.trim()) nextErrors.employeeCode = "Enter an employee code.";
    if (!values.post.trim()) nextErrors.post = "Enter the post / designation.";
    if (!values.joiningDate) nextErrors.joiningDate = "Select a joining date.";
    if (!values.salary.trim()) nextErrors.salary = "Enter the salary.";
    if (!values.aadhaarNumber.trim()) {
      nextErrors.aadhaarNumber = "Enter the Aadhaar number.";
    } else if (!/^\d{12}$/.test(values.aadhaarNumber.replace(/\s/g, ""))) {
      nextErrors.aadhaarNumber = "Aadhaar number must be 12 digits.";
    }
    if (roleCopy.siteRequired && !values.assignedSiteId) {
      nextErrors.assignedSiteId = "Select a site.";
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
      fatherName: values.fatherName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      caste: values.caste.trim(),
      height: values.height.trim(),
      aadhaarNumber: values.aadhaarNumber.replace(/\s/g, ""),
      panNumber: values.panNumber.trim().toUpperCase(),
      employeeCode: values.employeeCode.trim(),
      post: values.post.trim(),
      salary: values.salary.trim(),
      experience: values.experience.trim(),
      education: values.education.trim(),
      bankAccount: values.bankAccount.trim(),
      esiNumber: values.esiNumber.trim(),
      pfNumber: values.pfNumber.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <form className="staff-member-form" onSubmit={handleSubmit} noValidate>
      <FormPanel>
        {/* ── Section: Personal Details ── */}
        <p className="staff-member-form__section-label">Personal Details</p>
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
            label="Father's name"
            name="fatherName"
            value={values.fatherName}
            onChange={(e) => updateField("fatherName", e.target.value)}
            errorMessage={errors.fatherName}
            disabled={isSubmitting}
          />
          <TextField
            label="Mobile number"
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
            disabled={isSubmitting}
          />
          <TextField
            label="Caste"
            name="caste"
            value={values.caste}
            onChange={(e) => updateField("caste", e.target.value)}
            errorMessage={errors.caste}
            disabled={isSubmitting}
          />
          <TextField
            label="Height"
            name="height"
            placeholder={`e.g. 5'8"`}
            value={values.height}
            onChange={(e) => updateField("height", e.target.value)}
            errorMessage={errors.height}
            disabled={isSubmitting}
          />
        </div>

        <TextAreaField
          label="Address"
          name="address"
          value={values.address}
          onChange={(e) => updateField("address", e.target.value)}
          errorMessage={errors.address}
          placeholder="Full residential address"
          disabled={isSubmitting}
        />

        {/* ── Section: Identity Documents ── */}
        <p className="staff-member-form__section-label">Identity Documents</p>
        <div className="form-panel__grid">
          <TextField
            label="Aadhaar number"
            name="aadhaarNumber"
            value={values.aadhaarNumber}
            onChange={(e) => updateField("aadhaarNumber", e.target.value)}
            errorMessage={errors.aadhaarNumber}
            placeholder="12-digit Aadhaar"
            required
            disabled={isSubmitting}
          />
          <TextField
            label="PAN number"
            name="panNumber"
            value={values.panNumber}
            onChange={(e) => updateField("panNumber", e.target.value)}
            errorMessage={errors.panNumber}
            placeholder="e.g. ABCDE1234F"
            disabled={isSubmitting}
          />
        </div>

        {/* ── Section: Employment Details ── */}
        <p className="staff-member-form__section-label">Employment Details</p>
        <div className="form-panel__grid">
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
            label="Post / Designation"
            name="post"
            value={values.post}
            onChange={(e) => updateField("post", e.target.value)}
            errorMessage={errors.post}
            placeholder="e.g. Security Guard, Head Guard"
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Joining date"
            name="joiningDate"
            type="date"
            value={values.joiningDate}
            onChange={(e) => updateField("joiningDate", e.target.value)}
            errorMessage={errors.joiningDate}
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Salary (₹)"
            name="salary"
            value={values.salary}
            onChange={(e) => updateField("salary", e.target.value)}
            errorMessage={errors.salary}
            placeholder="e.g. 15000"
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Experience"
            name="experience"
            value={values.experience}
            onChange={(e) => updateField("experience", e.target.value)}
            errorMessage={errors.experience}
            placeholder="e.g. 3 years"
            disabled={isSubmitting}
          />
          <TextField
            label="Education"
            name="education"
            value={values.education}
            onChange={(e) => updateField("education", e.target.value)}
            errorMessage={errors.education}
            placeholder="e.g. 10th Pass, Graduate"
            disabled={isSubmitting}
          />
        </div>

        <SelectField
          label={roleCopy.siteLabel}
          name="assignedSiteId"
          options={SAMPLE_SITE_OPTIONS}
          value={values.assignedSiteId}
          onChange={(e) => updateField("assignedSiteId", e.target.value)}
          errorMessage={errors.assignedSiteId}
          required={roleCopy.siteRequired}
          disabled={isSubmitting}
        />

        {/* ── Section: Preferences ── */}
        <p className="staff-member-form__section-label">Preferences</p>
        <div className="form-panel__grid">
          <SelectField
            label="Ex-serviceman or Civilian"
            name="guardType"
            options={[
              { value: "ex-serviceman", label: "Ex-Serviceman" },
              { value: "civilian", label: "Civilian" },
            ]}
            placeholder="Select type"
            value={values.guardType}
            onChange={(e) =>
              updateField(
                "guardType",
                e.target.value as "ex-serviceman" | "civilian" | ""
              )
            }
            errorMessage={errors.guardType}
            disabled={isSubmitting}
          />
          <TextField
            label="Interested city"
            name="interestedCity"
            value={values.interestedCity}
            onChange={(e) => updateField("interestedCity", e.target.value)}
            errorMessage={errors.interestedCity}
            placeholder="e.g. Delhi, Mumbai"
            disabled={isSubmitting}
          />
        </div>
        <div className="staff-member-form__shift-row">
          <TextField
            label="Shift timing — From"
            name="shiftFrom"
            type="time"
            value={values.shiftFrom}
            onChange={(e) => updateField("shiftFrom", e.target.value)}
            errorMessage={errors.shiftFrom}
            disabled={isSubmitting}
          />
          <span className="staff-member-form__shift-sep">to</span>
          <TextField
            label="To"
            name="shiftTo"
            type="time"
            value={values.shiftTo}
            onChange={(e) => updateField("shiftTo", e.target.value)}
            errorMessage={errors.shiftTo}
            disabled={isSubmitting}
          />
        </div>

        {/* ── Section: Documents ── */}
        <p className="staff-member-form__section-label">Documents</p>
        <div className="form-panel__grid">
          <FileField
            label="Character certificate"
            name="characterCertificate"
            accept=".pdf,.jpg,.jpeg,.png"
            currentUrl={values.characterCertificateUrl}
            onChange={(file) => updateField("characterCertificateFile", file)}
            errorMessage={errors.characterCertificateFile as string | undefined}
            disabled={isSubmitting}
          />
          <FileField
            label="Police verification"
            name="policeVerification"
            accept=".pdf,.jpg,.jpeg,.png"
            currentUrl={values.policeVerificationUrl}
            onChange={(file) => updateField("policeVerificationFile", file)}
            errorMessage={errors.policeVerificationFile as string | undefined}
            disabled={isSubmitting}
          />
        </div>

        {/* ── Section: Financial / Compliance ── */}
        <p className="staff-member-form__section-label">Financial &amp; Compliance</p>
        <div className="form-panel__grid">
          <TextField
            label="Bank account number"
            name="bankAccount"
            value={values.bankAccount}
            onChange={(e) => updateField("bankAccount", e.target.value)}
            errorMessage={errors.bankAccount}
            disabled={isSubmitting}
          />
          <TextField
            label="ESI number"
            name="esiNumber"
            value={values.esiNumber}
            onChange={(e) => updateField("esiNumber", e.target.value)}
            errorMessage={errors.esiNumber}
            disabled={isSubmitting}
          />
          <TextField
            label="PF number"
            name="pfNumber"
            value={values.pfNumber}
            onChange={(e) => updateField("pfNumber", e.target.value)}
            errorMessage={errors.pfNumber}
            disabled={isSubmitting}
          />
        </div>

        {/* ── Notes ── */}
        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Shift preference, certifications, or onboarding notes"
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
