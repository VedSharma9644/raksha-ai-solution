import type { Timestamp } from "firebase/firestore";
import type { FormField } from "./formField";

/** Which form this schema applies to */
export type FormType = "guard" | "hr" | "site";

export interface FormSchema {
  id: string;
  agencyId: string;
  formType: FormType;
  fields: FormField[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const FORM_SCHEMAS_COLLECTION = "formSchemas";
