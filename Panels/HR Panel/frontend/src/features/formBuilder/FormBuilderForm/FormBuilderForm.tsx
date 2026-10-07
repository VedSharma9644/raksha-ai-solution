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

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
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
    await onSubmit(formData);
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
