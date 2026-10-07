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

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}

function Avatar({ name, url }: { name: string; url?: string }) {
  const initials = name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  if (url) return <img src={url} alt={name} className="guard-avatar guard-avatar--img" />;
  return <span className="guard-avatar guard-avatar--initials">{initials}</span>;
}

export interface GuardListScreenProps {
  guards: GuardListItem[];
  onBack: () => void;
  onSelectGuard?: (guardId: string) => void;
  onViewGuard?: (guardId: string) => void;
  onDeleteGuard?: (guardId: string) => void;
}

export function GuardListScreen({
  guards,
  onBack,
  onSelectGuard,
  onViewGuard,
  onDeleteGuard,
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
      const matchesStatus = statusFilter.length === 0 || guard.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [guards, searchQuery, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content guard-list-screen">
        <PageHeader
          title="Guard List"
          subtitle="Browse guards for leave and inventory operations."
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
                <th scope="col" style={{ width: "48px" }}></th>
                <th scope="col">Name</th>
                <th scope="col">Code</th>
                <th scope="col">Phone</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ width: "88px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="guard-list-table__empty">
                    No guards match your filters.
                  </td>
                </tr>
              ) : (
                filteredGuards.map((guard) => (
                  <tr key={guard.id} className="guard-list-table__row">
                    <td>
                      <Avatar name={guard.fullName} url={guard.profilePictureUrl} />
                    </td>
                    <td className="guard-list-table__name">{guard.fullName}</td>
                    <td>{guard.employeeCode}</td>
                    <td>{guard.phone}</td>
                    <td>
                      <span className={`guard-list-table__status guard-list-table__status--${guard.status}`}>
                        {STATUS_LABELS[guard.status]}
                      </span>
                    </td>
                    <td>
                      <div className="guard-list-table__actions">
                        {(onViewGuard ?? onSelectGuard) && (
                          <button
                            type="button"
                            className="guard-action-btn guard-action-btn--view"
                            onClick={() => (onViewGuard ?? onSelectGuard)!(guard.id)}
                            title="View guard"
                            aria-label={`View ${guard.fullName}`}
                          >
                            <IconEye />
                          </button>
                        )}
                        {onDeleteGuard && (
                          <button
                            type="button"
                            className="guard-action-btn guard-action-btn--delete"
                            onClick={() => onDeleteGuard(guard.id)}
                            title="Delete"
                            aria-label={`Delete ${guard.fullName}`}
                          >
                            <IconTrash />
                          </button>
                        )}
                      </div>
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
