/**
 * Utility helpers for branch-based filtering.
 *
 * Admin (strict=false):
 * - activeBranchId = null → all records ("All Branches")
 * - specific branch → matching branchId OR unassigned (branchId null)
 *
 * HR (strict=true):
 * - activeBranchId = null → no records (must pick a working branch)
 * - specific branch → ONLY records explicitly assigned to that branch
 */

/**
 * Filter an array of records by the active branch.
 *
 * @param strict - When true (HR), unassigned records are never shown.
 */
export function filterByBranch<T extends { branchId?: string | null }>(
  records: T[],
  activeBranchId: string | null,
  strict = false
): T[] {
  if (strict) {
    if (activeBranchId === null) return [];
    return records.filter((r) => r.branchId === activeBranchId);
  }

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
