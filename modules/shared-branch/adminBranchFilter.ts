/**
 * Admin branch filter semantics (matches Admin Panel branchFilter.ts):
 * - No filter → include everything
 * - Specific branch → matching branchId OR unassigned (null / missing / "")
 */
export function matchesAdminBranchFilter(
  recordBranchId: string | null | undefined,
  filterBranchId: string | null | undefined
): boolean {
  if (!filterBranchId) return true;
  const value = recordBranchId == null ? "" : String(recordBranchId).trim();
  return value === "" || value === filterBranchId;
}

export function parseOptionalBranchId(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed || undefined;
}
