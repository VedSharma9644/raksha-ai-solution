import type { FormEvent } from "react";
import { useState } from "react";
import type { FormField, FormType } from "@raskha/form-builder";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { TextField } from "../../../components/TextField";
import { TextAreaField } from "../../../components/TextAreaField";
import { SelectField } from "../../../components/SelectField";
import { FileField } from "../../../components/FileField";
import "./FormBuilderForm.css";

// ── Field Editor ─────────────────────────────────────────────────────────────

interface FieldEditorProps {
  fields: FormField[];
  isSaving: boolean;
  onAddField: (field: FormField) => void;
  onRemoveField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: "up" | "down") => void;
  onSave: () => void;
}

function FieldEditor({
  fields,
  isSaving,
  onAddField,
  onRemoveField,
  onMoveField,
  onSave,
}: FieldEditorProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FormField["type"]>("text");

  function handleAdd() {
    const label = newLabel.trim();
    if (!label) return;

    const id = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const maxOrder = fields.reduce((m, f) => Math.max(m, f.order), 0);

    onAddField({
      id: `custom_${id}_${Date.now()}`,
      label,
      type: newType,
      required: false,
      locked: false,
      order: maxOrder + 1,
    });

    setNewLabel("");
    setNewType("text");
  }

  return (
    <div className="form-builder-form__editor">
      <div className="form-builder-form__editor-header">
        <span className="form-builder-form__section-label">
          Form Fields
        </span>
        <Button
          type="button"
          variant="secondary"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Save Layout"}
        </Button>
      </div>

      <ul className="form-builder-form__field-list">
        {fields.map((field, index) => (
          <li key={field.id} className="form-builder-form__field-row">
            <span className="form-builder-form__field-name">
              {field.label}
              {field.required && (
                <span className="form-builder-form__required"> *</span>
              )}
              {field.locked && (
                <span className="form-builder-form__locked"> 🔒</span>
              )}
            </span>
            <span className="form-builder-form__field-type">{field.type}</span>
            <div className="form-builder-form__field-actions">
              <button
                type="button"
                className="form-builder-form__move-btn"
                onClick={() => onMoveField(field.id, "up")}
                disabled={index === 0}
                aria-label="Move up"
              >
                ▲
              </button>
              <button
                type="button"
                className="form-builder-form__move-btn"
                onClick={() => onMoveField(field.id, "down")}
                disabled={index === fields.length - 1}
                aria-label="Move down"
              >
                ▼
              </button>
              <button
                type="button"
                className="form-builder-form__remove-btn"
                onClick={() => onRemoveField(field.id)}
                disabled={field.locked}
                title={field.locked ? "Core field — cannot be removed" : "Remove field"}
                aria-label="Remove field"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="form-builder-form__add-row">
        <TextField
          label="New field label"
          name="newFieldLabel"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="e.g. Emergency Contact"
        />
        <SelectField
          label="Field type"
          name="newFieldType"
          value={newType}
          onChange={(e) =>
            setNewType(e.target.value as FormField["type"])
          }
          options={[
            { value: "text",     label: "Text" },
            { value: "textarea", label: "Text Area" },
            { value: "number",   label: "Number" },
            { value: "date",     label: "Date" },
            { value: "select",   label: "Dropdown" },
            { value: "file",     label: "File Upload" },
            { value: "phone",    label: "Phone" },
            { value: "email",    label: "Email" },
          ]}
        />
        <div className="form-builder-form__add-btn-wrap">
          <Button type="button" onClick={handleAdd} disabled={!newLabel.trim()}>
            + Add Field
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Dynamic field renderer ────────────────────────────────────────────────────

function renderField(
  field: FormField,
  value: string | File | null,
  error: string | undefined,
  disabled: boolean,
  onChange: (val: string | File | null) => void,
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

// ── Main component ────────────────────────────────────────────────────────────

export interface FormBuilderFormProps {
  formType: FormType;
  fields: FormField[];
  isSaving: boolean;
  isSubmitting: boolean;
  onSaveLayout: (fields: FormField[]) => void;
  onSubmit: (data: Record<string, string | File | null>) => void | Promise<void>;
  onCancel: () => void;
}

export function FormBuilderForm({
  formType,
  fields,
  isSaving,
  isSubmitting,
  onSaveLayout,
  onSubmit,
  onCancel,
}: FormBuilderFormProps) {
  const [localFields, setLocalFields] = useState<FormField[]>(fields);
  const [formData, setFormData] = useState<Record<string, string | File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep localFields in sync when parent reloads (e.g. after save)
  if (localFields !== fields && !isSaving) {
    setLocalFields(fields);
  }

  function handleFieldValue(fieldId: string, value: string | File | null) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: "" }));
  }

  function addField(field: FormField) {
    setLocalFields((prev) => [...prev, field]);
  }

  function removeField(fieldId: string) {
    setLocalFields((prev) => prev.filter((f) => f.id !== fieldId));
  }

  function moveField(fieldId: string, direction: "up" | "down") {
    setLocalFields((prev) => {
      const idx = prev.findIndex((f) => f.id === fieldId);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((f, i) => ({ ...f, order: i + 1 }));
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    for (const field of localFields) {
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

  const formLabels: Record<FormType, string> = {
    guard: "Save Guard",
    hr: "Save HR Staff",
    site: "Save Site",
  };

  return (
    <div className="form-builder-form">
      {/* ── Field Editor (top) ── */}
      <FieldEditor
        fields={localFields}
        isSaving={isSaving}
        onAddField={addField}
        onRemoveField={removeField}
        onMoveField={moveField}
        onSave={() => onSaveLayout(localFields)}
      />

      {/* ── Live Data Entry Form (bottom) ── */}
      <form
        className="form-builder-form__data-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <p className="form-builder-form__section-label">Fill in Details</p>
        <FormPanel>
          <div className="form-panel__grid">
            {localFields.map((field) =>
              renderField(
                field,
                formData[field.id] ?? (field.type === "file" ? null : ""),
                errors[field.id],
                isSubmitting,
                (val) => handleFieldValue(field.id, val),
              ),
            )}
          </div>

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
              {isSubmitting ? "Saving…" : formLabels[formType]}
            </Button>
          </div>
        </FormPanel>
      </form>
    </div>
  );
}
