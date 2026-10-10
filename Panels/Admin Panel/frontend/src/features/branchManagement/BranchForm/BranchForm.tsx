import type { FormEvent } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import { SelectField } from "../../../components/SelectField";
import type { BranchFormValues } from "../branchHooks";
import "./BranchForm.css";

export interface BranchFormProps {
  title: string;
  subtitle?: string;
  values: BranchFormValues & { status?: "active" | "inactive" };
  onChange: (values: BranchFormProps["values"]) => void;
  onSubmit: (values: BranchFormProps["values"]) => void;
  onBack: () => void;
  onDelete?: () => void;
  isSubmitting: boolean;
  isDeleting?: boolean;
  error: string;
  submitLabel?: string;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function BranchForm({
  title,
  subtitle,
  values,
  onChange,
  onSubmit,
  onBack,
  onDelete,
  isSubmitting,
  isDeleting = false,
  error,
  submitLabel = "Save Branch",
}: BranchFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  function field(key: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...values, [key]: e.target.value });
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content branch-form-screen">
        <PageHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          backLabel="Back to branches"
        />

        <form className="branch-form" onSubmit={handleSubmit} noValidate>
          <div className="branch-form__row">
            <TextField
              label="Branch Name *"
              name="name"
              value={values.name}
              onChange={field("name")}
              placeholder="e.g. Agra Branch"
              required
            />
            <TextField
              label="City *"
              name="city"
              value={values.city}
              onChange={field("city")}
              placeholder="e.g. Agra"
              required
            />
          </div>

          <div className="branch-form__row">
            <TextField
              label="Manager Name"
              name="managerName"
              value={values.managerName}
              onChange={field("managerName")}
              placeholder="Branch manager's name"
            />
            <TextField
              label="Phone"
              name="phone"
              value={values.phone}
              onChange={field("phone")}
              placeholder="+91 98765 43210"
            />
          </div>

          <TextField
            label="Address"
            name="address"
            value={values.address}
            onChange={field("address")}
            placeholder="Branch office address"
          />

          {values.status !== undefined && (
            <SelectField
              label="Status"
              name="status"
              value={values.status}
              options={STATUS_OPTIONS}
              onChange={field("status")}
            />
          )}

          {error ? <p className="branch-form__error">{error}</p> : null}

          <div className="branch-form__actions">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting || isDeleting}
            >
              {submitLabel}
            </Button>
            {onDelete && (
              <Button
                type="button"
                variant="danger"
                isLoading={isDeleting}
                disabled={isSubmitting || isDeleting}
                onClick={onDelete}
              >
                Delete Branch
              </Button>
            )}
          </div>
        </form>
      </div>
    </AppScreenLayout>
  );
}
