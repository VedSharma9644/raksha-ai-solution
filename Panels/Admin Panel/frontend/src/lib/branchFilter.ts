/**
 * Utility helpers for branch-based filtering.
 *
 * When `activeBranchId` is null it means "All Branches" — no filter is applied.
 * When a specific branch is selected, only records with a matching `branchId`
 * (or with no `branchId` set, which means the record is agency-wide/unassigned)
 * are shown to the Admin. Strictly assigned records only show in their branch.
 */

/**
 * Filter an array of records by the active branch.
 *
 * - Admin "All Branches" (activeBranchId = null): returns all records.
 * - Specific branch selected: returns records whose `branchId` matches OR
 *   whose `branchId` is null/undefined (unassigned records are visible in all branches).
 */
export function filterByBranch<T extends { branchId?: string | null }>(
  records: T[],
  activeBranchId: string | null
): T[] {
  if (activeBranchId === null) return records;
  return records.filter(
    (r) => r.branchId === activeBranchId || r.branchId == null
  );
}

/**
 * Append a `branchId` query parameter to a URL string when a branch is selected.
 */
export function appendBranchParam(
  url: string,
  activeBranchId: string | null
): string {
  if (!activeBranchId) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}branchId=${encodeURIComponent(activeBranchId)}`;
}
