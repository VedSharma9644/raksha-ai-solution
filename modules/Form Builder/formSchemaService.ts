import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { FORM_SCHEMAS_COLLECTION } from "./formSchema";
import type { FormSchema, FormType } from "./formSchema";
import type { FormField } from "./formField";
import {
  DEFAULT_GUARD_FIELDS,
  DEFAULT_HR_FIELDS,
  DEFAULT_SITE_FIELDS,
} from "./defaultSchemas";

/** Deterministic doc id — one schema per agency per form type. */
export function formSchemaDocId(agencyId: string, formType: FormType): string {
  return `${agencyId}_${formType}`;
}

/** Returns the built-in default fields for each form type. */
export function getDefaultFields(formType: FormType): FormField[] {
  switch (formType) {
    case "guard":
      return DEFAULT_GUARD_FIELDS;
    case "hr":
      return DEFAULT_HR_FIELDS;
    case "site":
      return DEFAULT_SITE_FIELDS;
  }
}

/**
 * Fetch the custom FormSchema for a given agency + form type.
 * Returns null if none has been saved yet (use default fields instead).
 * Uses a direct doc read (no composite index required).
 */
export async function getFormSchema(
  db: Firestore,
  agencyId: string,
  formType: FormType
): Promise<FormSchema | null> {
  const id = formSchemaDocId(agencyId, formType);
  const snapshot = await getDoc(doc(db, FORM_SCHEMAS_COLLECTION, id));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() } as FormSchema;
}

/**
 * Save (create or overwrite) a custom FormSchema for an agency + form type.
 */
export async function saveFormSchema(
  db: Firestore,
  agencyId: string,
  formType: FormType,
  fields: FormField[]
): Promise<FormSchema> {
  const id = formSchemaDocId(agencyId, formType);
  const ref = doc(db, FORM_SCHEMAS_COLLECTION, id);
  const existing = await getDoc(ref);

  const data = {
    id,
    agencyId,
    formType,
    fields,
    updatedAt: serverTimestamp(),
    createdAt: existing.exists()
      ? existing.data()?.createdAt
      : serverTimestamp(),
  };

  await setDoc(ref, data);
  return data as unknown as FormSchema;
}

/**
 * Delete a custom FormSchema for an agency + form type.
 */
export async function deleteFormSchema(
  db: Firestore,
  agencyId: string,
  formType: FormType
): Promise<void> {
  const id = formSchemaDocId(agencyId, formType);
  await deleteDoc(doc(db, FORM_SCHEMAS_COLLECTION, id));
}
