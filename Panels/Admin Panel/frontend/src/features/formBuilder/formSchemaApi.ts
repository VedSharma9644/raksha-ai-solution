import { adminFetch } from "@raskha/shared";

export type ApiFormType = "guard" | "hr" | "site";

export interface ApiFormSchema {
  id: string;
  agencyId: string;
  formType: ApiFormType;
  fields: unknown[];
}

export async function fetchFormSchemaApi(
  formType: ApiFormType
): Promise<ApiFormSchema | null> {
  const data = await adminFetch<{ schema: ApiFormSchema | null }>(
    `/api/form-schemas/${formType}`,
    { errorMessage: "You must be signed in to manage forms." }
  );
  return data.schema;
}

export async function saveFormSchemaApi(
  formType: ApiFormType,
  fields: unknown[]
): Promise<ApiFormSchema> {
  const data = await adminFetch<{ schema: ApiFormSchema }>(
    `/api/form-schemas/${formType}`,
    {
      method: "PUT",
      body: JSON.stringify({ fields }),
      errorMessage: "You must be signed in to manage forms.",
    }
  );
  return data.schema;
}
