import { useCallback, useEffect, useState } from "react";
import {
  getFormSchema,
  saveFormSchema,
  getDefaultFields,
} from "@raskha/form-builder";
import type { FormField, FormSchema, FormType } from "@raskha/form-builder";
import { db } from "../../lib/firebase";

export function useFormSchema(
  agencyId: string | undefined,
  formType: FormType,
) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [fields, setFields] = useState<FormField[]>(getDefaultFields(formType));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!agencyId) {
      setFields(getDefaultFields(formType));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getFormSchema(db, agencyId, formType)
      .then((result) => {
        if (result) {
          setSchema(result);
          setFields(result.fields);
        } else {
          setFields(getDefaultFields(formType));
        }
      })
      .catch(() => {
        setFields(getDefaultFields(formType));
      })
      .finally(() => setIsLoading(false));
  }, [agencyId, formType]);

  const saveFields = useCallback(
    async (updatedFields: FormField[]) => {
      if (!agencyId) return;
      setIsSaving(true);
      setError("");
      try {
        const saved = await saveFormSchema(db, agencyId, formType, updatedFields);
        setSchema(saved);
        setFields(updatedFields);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to save form schema.");
      } finally {
        setIsSaving(false);
      }
    },
    [agencyId, formType],
  );

  return { schema, fields, isLoading, isSaving, error, saveFields };
}
