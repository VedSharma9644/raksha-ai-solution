import { useEffect, useRef, useState } from "react";
import type { FormField, FormType, SelectOption } from "@raskha/form-builder";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { PasswordField } from "../../../components/PasswordField";
import { ProfilePictureField } from "../../../components/ProfilePictureField";
import { TextField } from "../../../components/TextField";
import { TextAreaField } from "../../../components/TextAreaField";
import { SelectField } from "../../../components/SelectField";
import { FileField } from "../../../components/FileField";
import "./FormBuilderStudio.css";

/** Types that require an options list */
const OPTION_TYPES = new Set<FormField["type"]>(["select", "checkbox", "radio"]);

const FIELD_TYPE_OPTIONS: { value: FormField["type"]; label: string }[] = [
  { value: "text",        label: "Text" },
  { value: "textarea",    label: "Text area" },
  { value: "number",      label: "Number" },
  { value: "date",        label: "Date" },
  { value: "select",      label: "Dropdown" },
  { value: "checkbox",    label: "Checkboxes" },
  { value: "radio",       label: "Radio buttons" },
  { value: "file",        label: "File upload" },
  { value: "phone",       label: "Phone" },
  { value: "email",       label: "Email" },
  { value: "shiftConfig", label: "Shift config" },
];

function typeLabel(type: FormField["type"]): string {
  return FIELD_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

// ── OptionsEditor — used both in "Add field" and in the inline row editor ────

interface OptionsEditorProps {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}

function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addOption() {
    const label = draft.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `opt_${Date.now()}`;
    onChange([...options, { value: `${value}_${Date.now()}`, label }]);
    setDraft("");
    inputRef.current?.focus();
  }

  function removeOption(idx: number) {
    onChange(options.filter((_, i) => i !== idx));
  }

  return (
    <div className="fb-options-editor">
      <p className="fb-options-editor__label">Options</p>
      {options.length === 0 && (
        <p className="fb-options-editor__empty">No options yet — add at least one.</p>
      )}
      <ul className="fb-options-editor__list">
        {options.map((opt, idx) => (
          <li key={opt.value} className="fb-options-editor__item">
            <span className="fb-options-editor__dot">•</span>
            <span className="fb-options-editor__text">{opt.label}</span>
            <button
              type="button"
              className="fb-options-editor__remove"
              onClick={() => removeOption(idx)}
              aria-label={`Remove option "${opt.label}"`}
            >×</button>
          </li>
        ))}
      </ul>
      <div className="fb-options-editor__add-row">
        <input
          ref={inputRef}
          type="text"
          className="fb-options-editor__input"
          placeholder="Option label…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
        />
        <button
          type="button"
          className="fb-options-editor__add-btn"
          onClick={addOption}
          disabled={!draft.trim()}
        >+ Add</button>
      </div>
    </div>
  );
}

// ── PreviewField ──────────────────────────────────────────────────────────────

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
    case "checkbox":
      return (
        <div key={field.id} style={{ gridColumn: "1 / -1" }}>
          <p style={{ fontSize: "var(--font-size-label, 0.85rem)", fontWeight: 600, margin: "0 0 0.4rem", color: "var(--color-on-surface)" }}>
            {field.label}{field.required ? " *" : ""}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {(field.options ?? [{ value: "sample", label: "Sample option" }]).map((opt) => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-on-surface)", opacity: 0.7 }}>
                <input type="checkbox" disabled /> {opt.label}
              </label>
            ))}
          </div>
        </div>
      );
    case "radio":
      return (
        <div key={field.id} style={{ gridColumn: "1 / -1" }}>
          <p style={{ fontSize: "var(--font-size-label, 0.85rem)", fontWeight: 600, margin: "0 0 0.4rem", color: "var(--color-on-surface)" }}>
            {field.label}{field.required ? " *" : ""}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {(field.options ?? [{ value: "sample", label: "Sample option" }]).map((opt) => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-on-surface)", opacity: 0.7 }}>
                <input type="radio" disabled /> {opt.label}
              </label>
            ))}
          </div>
        </div>
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
    case "shiftConfig":
      return (
        <div key={field.id} style={{ gridColumn: "1 / -1", background: "var(--color-surface-secondary, #f9fafb)", border: "1px dashed var(--color-border, #d1d5db)", borderRadius: "0.5rem", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--color-text-secondary, #6b7280)", fontSize: "0.875rem" }}>
            🕐 {field.label}
          </p>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "var(--color-text-secondary, #9ca3af)" }}>
            24-hour surveillance toggle · Interval check-in (minutes) · Shift slots (name, type, start / end time, guards needed)
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
  const [newOptions, setNewOptions] = useState<SelectOption[]>([]);
  const [expandedOptionsId, setExpandedOptionsId] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    if (!isSaving) {
      setLocalFields(fields);
    }
  }, [fields, isSaving]);

  // Reset newOptions when type changes to/from an option-requiring type
  function handleNewTypeChange(type: FormField["type"]) {
    setNewType(type);
    if (!OPTION_TYPES.has(type)) setNewOptions([]);
  }

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

    const newField: FormField = {
      id: `custom_${id}_${Date.now()}`,
      label,
      type: newType,
      required: false,
      locked: false,
      order: maxOrder + 1,
      ...(OPTION_TYPES.has(newType) ? { options: newOptions } : {}),
    };

    setLocalFields((prev) => [...prev, newField]);
    setNewLabel("");
    setNewType("text");
    setNewOptions([]);
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

  function updateFieldOptions(fieldId: string, options: SelectOption[]) {
    setLocalFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, options } : f))
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
                      {OPTION_TYPES.has(field.type) && field.options ? (
                        <span className="fb-chip fb-chip--muted">
                          {field.options.length} option{field.options.length !== 1 ? "s" : ""}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
                <div className="fb-studio__actions">
                  {/* Options toggle for select / checkbox / radio */}
                  {OPTION_TYPES.has(field.type) && !field.locked ? (
                    <button
                      type="button"
                      className={`fb-icon-btn${expandedOptionsId === field.id ? " fb-icon-btn--active" : ""}`}
                      onClick={() => setExpandedOptionsId(expandedOptionsId === field.id ? null : field.id)}
                      title="Edit options"
                    >
                      ⋮
                    </button>
                  ) : null}
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
                {/* Inline options editor */}
                {expandedOptionsId === field.id && OPTION_TYPES.has(field.type) ? (
                  <div className="fb-studio__inline-options">
                    <OptionsEditor
                      options={field.options ?? []}
                      onChange={(opts) => updateFieldOptions(field.id, opts)}
                    />
                  </div>
                ) : null}              </li>
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
              onChange={(e) => handleNewTypeChange(e.target.value as FormField["type"])}
              options={FIELD_TYPE_OPTIONS}
            />
            {/* Options editor shown when type requires options */}
            {OPTION_TYPES.has(newType) ? (
              <div className="fb-studio__add-options">
                <OptionsEditor
                  options={newOptions}
                  onChange={setNewOptions}
                />
              </div>
            ) : null}
            <div className="fb-studio__add-action">
              <Button
                type="button"
                onClick={handleAdd}
                disabled={!newLabel.trim() || (OPTION_TYPES.has(newType) && newOptions.length === 0)}
              >
                Add field
              </Button>
              {OPTION_TYPES.has(newType) && newOptions.length === 0 ? (
                <p className="fb-studio__add-hint">Add at least one option above to enable.</p>
              ) : null}
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
