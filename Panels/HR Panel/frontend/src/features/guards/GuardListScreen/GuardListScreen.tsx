import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import type { GuardListItem } from "../guardTypes";
import "./GuardListScreen.css";

const STATUS_LABELS = {
  active: "Active",
  on_leave: "On leave",
  inactive: "Inactive",
} as const;

export interface GuardListScreenProps {
  guards: GuardListItem[];
  onBack: () => void;
  onSelectGuard?: (guardId: string) => void;
}

export function GuardListScreen({
  guards,
  onBack,
  onSelectGuard,
}: GuardListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredGuards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return guards.filter((guard) => {
      const matchesQuery =
        query.length === 0 ||
        guard.fullName.toLowerCase().includes(query) ||
        guard.employeeCode.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter.length === 0 || guard.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [guards, searchQuery, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content guard-list-screen">
        <PageHeader
          title="Guard List"
          subtitle="Browse guards for leave and inventory operations. Site details are not shown here."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="guard-list-screen__filters">
          <TextField
            label="Search"
            name="guardSearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Name or employee code"
          />
          <SelectField
            label="Status"
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="All statuses"
            options={[
              { value: "active", label: "Active" },
              { value: "on_leave", label: "On leave" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>

        <div className="guard-list-screen__table-wrap">
          <table className="guard-list-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Code</th>
                <th scope="col">Phone</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="guard-list-table__empty">
                    No guards match your filters.
                  </td>
                </tr>
              ) : (
                filteredGuards.map((guard) => (
                  <tr
                    key={guard.id}
                    className={
                      onSelectGuard
                        ? "guard-list-table__row--clickable"
                        : undefined
                    }
                    onClick={
                      onSelectGuard
                        ? () => onSelectGuard(guard.id)
                        : undefined
                    }
                  >
                    <td>{guard.fullName}</td>
                    <td>{guard.employeeCode}</td>
                    <td>{guard.phone}</td>
                    <td>
                      <span
                        className={`guard-list-table__status guard-list-table__status--${guard.status}`}
                      >
                        {STATUS_LABELS[guard.status]}
                      </span>
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
