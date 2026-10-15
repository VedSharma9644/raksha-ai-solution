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
    { errorMessage: "You must be signed in to load forms." }
  );
  return data.schema;
}
