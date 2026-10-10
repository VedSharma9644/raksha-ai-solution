import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import type { Branch } from "@raskha/branch-management";
import "./BranchListScreen.css";

export interface BranchListScreenProps {
  branches: Branch[];
  isLoading: boolean;
  error: string;
  onBack: () => void;
  onAddBranch: () => void;
  onEditBranch: (branchId: string) => void;
}

export function BranchListScreen({
  branches,
  isLoading,
  error,
  onBack,
  onAddBranch,
  onEditBranch,
}: BranchListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        (b.managerName ?? "").toLowerCase().includes(q)
    );
  }, [branches, searchQuery]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content branch-list-screen">
        <PageHeader
          title="Branches"
          subtitle="Manage your agency's branch offices. Each branch can have its own guards, sites, and HR staff."
          onBack={onBack}
          backLabel="Back to dashboard"
          actions={
            <Button type="button" onClick={onAddBranch}>
              + Add Branch
            </Button>
          }
        />

        <div className="branch-list-screen__filters">
          <TextField
            label="Search"
            name="branchSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Branch name, city, or manager"
          />
        </div>

        {error ? (
          <p className="branch-list-screen__error">{error}</p>
        ) : null}

        <div className="branch-list-screen__table-wrap">
          <table className="branch-table">
            <thead>
              <tr>
                <th scope="col">Branch Name</th>
                <th scope="col">City</th>
                <th scope="col">Manager</th>
                <th scope="col">Phone</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="branch-table__empty">
                    Loading branches…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="branch-table__empty">
                    {branches.length === 0
                      ? "No branches yet. Create your first branch to get started."
                      : "No branches match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((branch) => (
                  <tr key={branch.id} className="branch-table__row">
                    <td className="branch-table__name">{branch.name}</td>
                    <td>{branch.city}</td>
                    <td>{branch.managerName || "—"}</td>
                    <td>{branch.phone || "—"}</td>
                    <td>
                      <span className={`branch-table__status branch-table__status--${branch.status}`}>
                        {branch.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="branch-action-btn"
                        onClick={() => onEditBranch(branch.id)}
                        title="Edit branch"
                        aria-label={`Edit ${branch.name}`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppScreenLayout>
  );
}
