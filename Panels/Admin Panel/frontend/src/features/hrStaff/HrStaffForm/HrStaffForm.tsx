import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { listSitesByAgency } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { PasswordField } from "../../../components/PasswordField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import { useAuthContext } from "../../authentication";
import { useBranchContext } from "../../branches";
import { db } from "../../../lib/firebase";
import "./HrStaffForm.css";

export interface HrStaffFormValues {
  fullName: string;
  employeeCode: string;
  phone: string;
  email: string;
  password: string;
  notes: string;
  assignedBranchIds: string[];
  assignedSiteIds: string[];
}

export const EMPTY_HR_STAFF_FORM: HrStaffFormValues = {
  fullName: "",
  employeeCode: "",
  phone: "",
  email: "",
  password: "",
  notes: "",
  assignedBranchIds: [],
  assignedSiteIds: [],
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
  const { agency } = useAuthContext();
  const { branches } = useBranchContext();
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [values, setValues] = useState<HrStaffFormValues>({
    ...EMPTY_HR_STAFF_FORM,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof HrStaffFormValues, string>>>({});

  useEffect(() => {
    if (!agency?.id) return;
    setSitesLoading(true);
    listSitesByAgency(db, agency.id)
      .then(setSites)
      .catch(() => setSites([]))
      .finally(() => setSitesLoading(false));
  }, [agency?.id]);

  const sitesForSelectedBranches = useMemo(() => {
    const branchSet = new Set(values.assignedBranchIds);
    if (branchSet.size === 0) return [];
    return sites
      .filter((s) => s.branchId && branchSet.has(s.branchId))
      .sort((a, b) => a.siteName.localeCompare(b.siteName));
  }, [sites, values.assignedBranchIds]);

  function updateField<K extends keyof HrStaffFormValues>(
    field: K,
    value: HrStaffFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function setAssignedBranches(ids: string[]) {
    const allowedSites = sites.filter(
      (s) => s.branchId && ids.includes(s.branchId)
    );
    const allowedSiteIds = new Set(allowedSites.map((s) => s.id));
    setValues((current) => ({
      ...current,
      assignedBranchIds: ids,
      // Drop site picks that no longer fall under selected branches
      assignedSiteIds: current.assignedSiteIds.filter((id) =>
        allowedSiteIds.has(id)
      ),
    }));
    setErrors((current) => ({
      ...current,
      assignedBranchIds: undefined,
      assignedSiteIds: undefined,
    }));
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

    if (values.assignedBranchIds.length === 0) {
      nextErrors.assignedBranchIds = "Select at least one branch.";
    }

    if (values.assignedSiteIds.length === 0) {
      nextErrors.assignedSiteIds = "Select at least one site this HR will manage.";
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
      <FormPanel className="form-panel--wide">
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

        {branches.length > 0 && (
          <>
            <p className="hr-staff-form__section-label">Branch Assignment</p>
            <p className="hr-staff-form__section-hint">
              Select which branches this HR staff member can access.
            </p>
            <div className="hr-staff-form__branch-checkboxes">
              {branches.map((branch) => (
                <label key={branch.id} className="hr-staff-form__branch-checkbox-label">
                  <input
                    type="checkbox"
                    checked={values.assignedBranchIds.includes(branch.id)}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const ids = e.target.checked
                        ? [...values.assignedBranchIds, branch.id]
                        : values.assignedBranchIds.filter((id) => id !== branch.id);
                      setAssignedBranches(ids);
                    }}
                  />
                  <span>{branch.name}</span>
                  {branch.city ? (
                    <span className="hr-staff-form__branch-city"> — {branch.city}</span>
                  ) : null}
                </label>
              ))}
            </div>
            {errors.assignedBranchIds ? (
              <p className="hr-staff-form__field-error">{errors.assignedBranchIds}</p>
            ) : null}
          </>
        )}

        <p className="hr-staff-form__section-label">Site Assignment</p>
        <p className="hr-staff-form__section-hint">
          Select which sites this HR manages. They will only see guards,
          attendance, leave, relief, and scheduling for these sites.
        </p>
        {sitesLoading ? (
          <p className="hr-staff-form__section-hint">Loading sites…</p>
        ) : values.assignedBranchIds.length === 0 ? (
          <p className="hr-staff-form__section-hint">
            Select a branch first to choose sites.
          </p>
        ) : sitesForSelectedBranches.length === 0 ? (
          <p className="hr-staff-form__section-hint">
            No sites allotted to the selected branch(es) yet.
          </p>
        ) : (
          <div className="hr-staff-form__branch-checkboxes">
            {sitesForSelectedBranches.map((site) => (
              <label key={site.id} className="hr-staff-form__branch-checkbox-label">
                <input
                  type="checkbox"
                  checked={values.assignedSiteIds.includes(site.id)}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const ids = e.target.checked
                      ? [...values.assignedSiteIds, site.id]
                      : values.assignedSiteIds.filter((id) => id !== site.id);
                    updateField("assignedSiteIds", ids);
                  }}
                />
                <span>{site.siteName}</span>
              </label>
            ))}
          </div>
        )}
        {errors.assignedSiteIds ? (
          <p className="hr-staff-form__field-error">{errors.assignedSiteIds}</p>
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
