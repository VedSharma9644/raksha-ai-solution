/**
 * Utility helpers for branch-based filtering.
 *
 * HR Panel — strict match only: records must be explicitly assigned to the
 * active branch. Unassigned records (branchId = null) are NOT shown to HR.
 *
 * Admin Panel uses its own copy of this file that also shows unassigned records.
 */

/**
 * Filter an array of records by the active branch.
 *
 * - activeBranchId = null (no branch selected): returns all records in assigned branches
 * - Specific branch selected: returns ONLY records explicitly assigned to that branch
 */
export function filterByBranch<T extends { branchId?: string | null }>(
  records: T[],
  activeBranchId: string | null
): T[] {
  if (activeBranchId === null) {
    // Show all records that have any branchId (exclude unassigned)
    return records.filter((r) => r.branchId != null);
  }
  // Strict: only records assigned to this branch
  return records.filter((r) => r.branchId === activeBranchId);
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
