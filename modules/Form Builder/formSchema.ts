import type { Timestamp } from "firebase/firestore";
import type { FormField } from "./formField";

/** Which form this schema applies to */
export type FormType = "guard" | "hr" | "site";

export interface FormSchema {
  id: string;
  agencyId: string;
  formType: FormType;
  fields: FormField[];
  /** Branch this form schema is scoped to. null/undefined = agency-wide. */
  branchId?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const FORM_SCHEMAS_COLLECTION = "formSchemas";
