// ── FormField ─────────────────────────────────────────────────────────────────

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "file"
  | "phone"
  | "email";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormField {
  /** Unique key within the schema — maps to a data property (e.g. "fullName") */
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  /**
   * locked = true means this is a core field that can never be deleted
   * by the agency admin or Super Admin.
   */
  locked: boolean;
  placeholder?: string;
  /** Only used when type === "select" */
  options?: SelectOption[];
  /** Display order (1-based, ascending) */
  order: number;
}
