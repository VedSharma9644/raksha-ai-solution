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
import "./FormBuilderStudio.css";

const FIELD_TYPE_OPTIONS: { value: FormField["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text area" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "file", label: "File upload" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
];

function typeLabel(type: FormField["type"]): string {
  return FIELD_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function PreviewField({ field }: { field: FormField }) {
  switch (field.type) {
    case "textarea":
      return (
        <TextAreaField
          label={field.label}
          name={`preview_${field.id}`}
          value=""
          onChange={() => undefined}
          placeholder={field.placeholder ?? "Preview"}
          disabled
        />
      );
    case "select":
      return (
        <SelectField
          label={field.label}
          name={`preview_${field.id}`}
          value=""
          onChange={() => undefined}
          options={field.options ?? [{ value: "", label: "Select…" }]}
          required={field.required}
          disabled
        />
      );
    case "file":
      return (
        <FileField
          label={field.label}
          name={`preview_${field.id}`}
          onChange={() => undefined}
          required={field.required}
          disabled
        />
      );

    case "profilePicture":
      return (
        <div key={field.id} style={{ gridColumn: "1 / -1" }}>
          <ProfilePictureField
            name=""
            disabled
            onChange={() => undefined}
          />
        </div>
      );

    case "password":
      return (
        <div key={field.id} style={{ gridColumn: "1 / -1" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-secondary, #6b7280)", margin: "1rem 0 0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--color-border, #e5e7eb)" }}>
            {field.label}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <PasswordField
              label="Password"
              name={`preview_${field.id}`}
              value=""
              onChange={() => undefined}
              placeholder="Min. 8 characters"
              disabled
            />
            <PasswordField
              label="Confirm password"
              name={`preview_confirm_${field.id}`}
              value=""
              onChange={() => undefined}
              placeholder="Re-enter password"
              disabled
            />
          </div>
        </div>
      );

    case "location":
      return (
        <div key={field.id} style={{ gridColumn: "1 / -1", background: "var(--color-surface-secondary, #f9fafb)", border: "1px dashed var(--color-border, #d1d5db)", borderRadius: "0.5rem", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--color-text-secondary, #6b7280)", fontSize: "0.875rem" }}>
            📍 {field.label}
          </p>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "var(--color-text-secondary, #9ca3af)" }}>
            Google Maps location picker with address search and lat / lng — visible in the live form
          </p>
        </div>
      );
    default:
      return (
        <TextField
          label={field.label}
          name={`preview_${field.id}`}
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
          value=""
          onChange={() => undefined}
          placeholder={field.placeholder ?? "Preview"}
          required={field.required}
          disabled
        />
      );
  }
}

export interface FormBuilderStudioProps {
  formType: FormType;
  fields: FormField[];
  isSaving: boolean;
  onSave: (fields: FormField[]) => void | Promise<unknown>;
  onBack: () => void;
}

export function FormBuilderStudio({
  formType,
  fields,
  isSaving,
  onSave,
  onBack,
}: FormBuilderStudioProps) {
  const [localFields, setLocalFields] = useState<FormField[]>(fields);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FormField["type"]>("text");
  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    if (!isSaving) {
      setLocalFields(fields);
    }
  }, [fields, isSaving]);

  const titles: Record<FormType, string> = {
    guard: "Guard form",
    hr: "HR staff form",
    site: "Site form",
  };

  function handleAdd() {
    const label = newLabel.trim();
    if (!label) return;

    const id = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const maxOrder = localFields.reduce((m, f) => Math.max(m, f.order), 0);

    setLocalFields((prev) => [
      ...prev,
      {
        id: `custom_${id}_${Date.now()}`,
        label,
        type: newType,
        required: false,
        locked: false,
        order: maxOrder + 1,
      },
    ]);
    setNewLabel("");
    setNewType("text");
    setSaveNotice("");
  }

  function removeField(fieldId: string) {
    setLocalFields((prev) => prev.filter((f) => f.id !== fieldId));
    setSaveNotice("");
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
    setSaveNotice("");
  }

  function toggleRequired(fieldId: string) {
    setLocalFields((prev) =>
      prev.map((f) =>
        f.id === fieldId && !f.locked ? { ...f, required: !f.required } : f
      )
    );
    setSaveNotice("");
  }

  async function handleSave() {
    setSaveNotice("");
    try {
      await onSave(localFields);
      setSaveNotice("Layout saved.");
    } catch {
      setSaveNotice("");
    }
  }

  return (
    <div className="fb-studio">
      <div className="fb-studio__toolbar">
        <button type="button" className="fb-studio__back" onClick={onBack}>
          ← Choose another form
        </button>
        <div className="fb-studio__toolbar-actions">
          {saveNotice ? (
            <span className="fb-studio__saved" role="status">
              {saveNotice}
            </span>
          ) : null}
          <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save layout"}
          </Button>
        </div>
      </div>

      <div className="fb-studio__grid">
        <section className="fb-studio__editor" aria-labelledby="fb-studio-edit-title">
          <p className="fb-eyebrow">Edit fields</p>
          <h2 id="fb-studio-edit-title" className="fb-studio__title">
            {titles[formType]}
          </h2>
          <p className="fb-studio__hint">
            Add, reorder, or remove fields. Core fields stay locked. Preview
            updates on the right.
          </p>

          <ul className="fb-studio__list">
            {localFields.map((field, index) => (
              <li key={field.id} className="fb-studio__row">
                <div className="fb-studio__row-main">
                  <span className="fb-studio__order">{index + 1}</span>
                  <div className="fb-studio__meta">
                    <span className="fb-studio__name">
                      {field.label}
                      {field.required ? (
                        <span className="fb-studio__req" aria-hidden>
                          *
                        </span>
                      ) : null}
                    </span>
                    <span className="fb-studio__chips">
                      <span className="fb-chip">{typeLabel(field.type)}</span>
                      {field.locked ? (
                        <span className="fb-chip fb-chip--muted">Core</span>
                      ) : null}
                    </span>
                  </div>
                </div>
                <div className="fb-studio__actions">
                  {!field.locked ? (
                    <button
                      type="button"
                      className={`fb-icon-btn${field.required ? " fb-icon-btn--active" : ""}`}
                      onClick={() => toggleRequired(field.id)}
                      title={field.required ? "Make optional" : "Make required"}
                      aria-label={
                        field.required
                          ? "Make field optional"
                          : "Make field required"
                      }
                    >
                      Req
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="fb-icon-btn"
                    onClick={() => moveField(field.id, "up")}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="fb-icon-btn"
                    onClick={() => moveField(field.id, "down")}
                    disabled={index === localFields.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="fb-icon-btn fb-icon-btn--danger"
                    onClick={() => removeField(field.id)}
                    disabled={field.locked}
                    title={
                      field.locked
                        ? "Core field — cannot be removed"
                        : "Remove field"
                    }
                    aria-label="Remove field"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="fb-studio__add">
            <TextField
              label="New field label"
              name="newFieldLabel"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Emergency contact"
            />
            <SelectField
              label="Type"
              name="newFieldType"
              value={newType}
              onChange={(e) => setNewType(e.target.value as FormField["type"])}
              options={FIELD_TYPE_OPTIONS}
            />
            <div className="fb-studio__add-action">
              <Button
                type="button"
                onClick={handleAdd}
                disabled={!newLabel.trim()}
              >
                Add field
              </Button>
            </div>
          </div>
        </section>

        <aside className="fb-studio__preview" aria-labelledby="fb-studio-preview-title">
          <div className="fb-studio__preview-sticky">
            <p className="fb-eyebrow">Live preview</p>
            <h2 id="fb-studio-preview-title" className="fb-studio__title">
              How it looks
            </h2>
            <p className="fb-studio__hint">
              This is what staff will fill on Add / Edit screens.
            </p>
            <FormPanel>
              <div className="form-panel__grid">
                {localFields.map((field) => (
                  <PreviewField key={field.id} field={field} />
                ))}
              </div>
            </FormPanel>
          </div>
        </aside>
      </div>
    </div>
  );
}
