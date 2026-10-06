import { useCallback, useEffect, useState } from "react";
import { getDefaultFields } from "@raskha/form-builder";
import type { FormField, FormSchema, FormType } from "@raskha/form-builder";
import {
  fetchFormSchemaApi,
  saveFormSchemaApi,
} from "./formSchemaApi";

/**
 * Loads / saves custom form schemas via Admin API (Admin SDK).
 * Avoids client Firestore permission errors on formSchemas.
 */
export function useFormSchema(
  agencyId: string | undefined,
  formType: FormType
) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [fields, setFields] = useState<FormField[]>(getDefaultFields(formType));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!agencyId) {
      setSchema(null);
      setFields(getDefaultFields(formType));
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    fetchFormSchemaApi(formType)
      .then((result) => {
        if (cancelled) return;
        if (result && Array.isArray(result.fields) && result.fields.length > 0) {
          const sorted = [...(result.fields as FormField[])].sort(
            (a, b) => a.order - b.order
          );
          setSchema(result as unknown as FormSchema);
          setFields(sorted);
        } else {
          setSchema(null);
          setFields(getDefaultFields(formType));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load form schema.");
        setSchema(null);
        setFields(getDefaultFields(formType));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [agencyId, formType]);

  const saveFields = useCallback(
    async (updatedFields: FormField[]) => {
      if (!agencyId) {
        throw new Error("Agency is not loaded.");
      }
      setIsSaving(true);
      setError("");
      try {
        const saved = await saveFormSchemaApi(formType, updatedFields);
        setSchema(saved as unknown as FormSchema);
        setFields(updatedFields);
        return saved as unknown as FormSchema;
      } catch (err: unknown) {
        const e = err as { message?: string };
        const message = e.message ?? "Failed to save form schema.";
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [agencyId, formType]
  );

  return { schema, fields, isLoading, isSaving, error, saveFields };
}
