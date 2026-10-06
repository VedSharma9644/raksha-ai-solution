import { useCallback, useEffect, useState } from "react";
import { getDefaultFields } from "@raskha/form-builder";
import type { FormField, FormSchema, FormType } from "@raskha/form-builder";
import { fetchFormSchemaApi } from "./formSchemaApi";

/**
 * Loads custom form schemas via Admin API (Admin SDK).
 * HR is fill-only — save is not exposed here.
 */
export function useFormSchema(
  agencyId: string | undefined,
  formType: FormType
) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [fields, setFields] = useState<FormField[]>(getDefaultFields(formType));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving] = useState(false);
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

  const saveFields = useCallback(async (_updatedFields: FormField[]) => {
    throw new Error("HR users cannot edit form layouts.");
  }, []);

  return { schema, fields, isLoading, isSaving, error, saveFields };
}
