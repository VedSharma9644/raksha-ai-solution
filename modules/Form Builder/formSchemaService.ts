import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
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

/** Returns the built-in default fields for each form type. */
export function getDefaultFields(formType: FormType): FormField[] {
  switch (formType) {
    case "guard": return DEFAULT_GUARD_FIELDS;
    case "hr":    return DEFAULT_HR_FIELDS;
    case "site":  return DEFAULT_SITE_FIELDS;
  }
}

/**
 * Fetch the custom FormSchema for a given agency + form type.
 * Returns null if none has been saved yet (use default fields instead).
 */
export async function getFormSchema(
  db: Firestore,
  agencyId: string,
  formType: FormType,
): Promise<FormSchema | null> {
  const q = query(
    collection(db, FORM_SCHEMAS_COLLECTION),
    where("agencyId", "==", agencyId),
    where("formType", "==", formType),
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as FormSchema;
}

/**
 * Save (create or overwrite) a custom FormSchema for an agency + form type.
 * Uses agencyId + formType as a deterministic document ID so there's always
 * at most one schema per agency per form.
 */
export async function saveFormSchema(
  db: Firestore,
  agencyId: string,
  formType: FormType,
  fields: FormField[],
): Promise<FormSchema> {
  const id = `${agencyId}_${formType}`;
  const ref = doc(db, FORM_SCHEMAS_COLLECTION, id);
  const existing = await getDoc(ref);

  const data = {
    id,
    agencyId,
    formType,
    fields,
    updatedAt: serverTimestamp(),
    createdAt: existing.exists()
      ? existing.data().createdAt
      : serverTimestamp(),
  };

  await setDoc(ref, data);
  return data as unknown as FormSchema;
}

/**
 * Delete a custom FormSchema for an agency + form type.
 * After deletion the panel will fall back to the default hardcoded form.
 */
export async function deleteFormSchema(
  db: Firestore,
  agencyId: string,
  formType: FormType,
): Promise<void> {
  const id = `${agencyId}_${formType}`;
  await deleteDoc(doc(db, FORM_SCHEMAS_COLLECTION, id));
}
