import { saFetch } from "../../lib/saApi";

export interface AgencyModuleAccessRow {
  agencyId: string;
  enabledFeatureIds: string[];
}

export async function listModuleAccessApi(): Promise<AgencyModuleAccessRow[]> {
  const data = await saFetch<{ modules: AgencyModuleAccessRow[] }>(
    "/api/modules"
  );
  return data.modules;
}

export async function saveModuleAccessApi(
  agencyId: string,
  enabledFeatureIds: string[]
): Promise<AgencyModuleAccessRow> {
  return saFetch<AgencyModuleAccessRow>(
    `/api/modules/${encodeURIComponent(agencyId)}`,
    {
      method: "PUT",
      body: JSON.stringify({ enabledFeatureIds }),
    }
  );
}
