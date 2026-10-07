import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import type { EmployeeListItem } from "../employeeListTypes";
import "./EmployeeListScreen.css";

const ROLE_LABELS = {
  guard: "Guard",
  supervisor: "Supervisor",
  hr: "HR",
} as const;

const STATUS_LABELS = {
  active: "Active",
  on_leave: "On leave",
  inactive: "Inactive",
} as const;

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, url }: { name: string; url?: string }) {
  const initials = name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  if (url) {
    return <img src={url} alt={name} className="emp-avatar emp-avatar--img" />;
  }
  return <span className="emp-avatar emp-avatar--initials">{initials}</span>;
}

export interface EmployeeListScreenProps {
  employees: EmployeeListItem[];
  onBack: () => void;
  onViewEmployee?: (employeeId: string) => void;
  onSelectEmployee?: (employeeId: string) => void;
  onDeleteEmployee?: (employeeId: string) => void;
}

export function EmployeeListScreen({
  employees,
  onBack,
  onViewEmployee,
  onSelectEmployee,
  onDeleteEmployee,
}: EmployeeListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesQuery =
        query.length === 0 ||
        employee.fullName.toLowerCase().includes(query) ||
        employee.employeeCode.toLowerCase().includes(query) ||
        employee.assignedSite.toLowerCase().includes(query);
      const matchesRole = roleFilter.length === 0 || employee.role === roleFilter;
      const matchesStatus = statusFilter.length === 0 || employee.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [employees, roleFilter, searchQuery, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content employee-list-screen">
        <PageHeader
          title="Employee / Guard List"
          subtitle="Search and review everyone working under this agency."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="employee-list-screen__filters">
          <TextField
            label="Search"
            name="employeeSearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Name, code, or site"
          />
          <SelectField
            label="Role"
            name="roleFilter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            placeholder="All roles"
            options={[
              { value: "guard", label: "Guard" },
              { value: "supervisor", label: "Supervisor" },
              { value: "hr", label: "HR" },
            ]}
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

        <div className="employee-list-screen__table-wrap">
          <table className="employee-list-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: "48px" }}></th>
                <th scope="col">Name</th>
                <th scope="col">Code</th>
                <th scope="col">Role</th>
                <th scope="col">Site</th>
                <th scope="col">Phone</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ width: "112px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="employee-list-table__empty">
                    No employees match your filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="employee-list-table__row">
                    <td>
                      <Avatar name={employee.fullName} url={employee.profilePictureUrl} />
                    </td>
                    <td className="employee-list-table__name">{employee.fullName}</td>
                    <td>{employee.employeeCode}</td>
                    <td>{ROLE_LABELS[employee.role]}</td>
                    <td>{employee.assignedSite}</td>
                    <td>{employee.phone}</td>
                    <td>
                      <span className={`employee-list-table__status employee-list-table__status--${employee.status}`}>
                        {STATUS_LABELS[employee.status]}
                      </span>
                    </td>
                    <td>
                      <div className="employee-list-table__actions">
                        {onViewEmployee && (
                          <button
                            type="button"
                            className="emp-action-btn emp-action-btn--view"
                            onClick={() => onViewEmployee(employee.id)}
                            title="View profile"
                            aria-label={`View ${employee.fullName}`}
                          >
                            <IconEye />
                          </button>
                        )}
                        {onSelectEmployee && (
                          <button
                            type="button"
                            className="emp-action-btn emp-action-btn--edit"
                            onClick={() => onSelectEmployee(employee.id)}
                            title="Edit"
                            aria-label={`Edit ${employee.fullName}`}
                          >
                            <IconPencil />
                          </button>
                        )}
                        {onDeleteEmployee && (
                          <button
                            type="button"
                            className="emp-action-btn emp-action-btn--delete"
                            onClick={() => onDeleteEmployee(employee.id)}
                            title="Delete"
                            aria-label={`Delete ${employee.fullName}`}
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

const ROLE_LABELS = {
  guard: "Guard",
  supervisor: "Supervisor",
  hr: "HR",
} as const;

const STATUS_LABELS = {
  active: "Active",
  on_leave: "On leave",
  inactive: "Inactive",
} as const;

export interface EmployeeListScreenProps {
  employees: EmployeeListItem[];
  onBack: () => void;
  onSelectEmployee?: (employeeId: string) => void;
}

export function EmployeeListScreen({
  employees,
  onBack,
  onSelectEmployee,
}: EmployeeListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesQuery =
        query.length === 0 ||
        employee.fullName.toLowerCase().includes(query) ||
        employee.employeeCode.toLowerCase().includes(query) ||
        employee.assignedSite.toLowerCase().includes(query);

      const matchesRole = roleFilter.length === 0 || employee.role === roleFilter;
      const matchesStatus =
        statusFilter.length === 0 || employee.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [employees, roleFilter, searchQuery, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content employee-list-screen">
        <PageHeader
          title="Employee / Guard List"
          subtitle="Search and review everyone working under this agency."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="employee-list-screen__filters">
          <TextField
            label="Search"
            name="employeeSearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Name, code, or site"
          />
          <SelectField
            label="Role"
            name="roleFilter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            placeholder="All roles"
            options={[
              { value: "guard", label: "Guard" },
              { value: "supervisor", label: "Supervisor" },
              { value: "hr", label: "HR" },
            ]}
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

        <div className="employee-list-screen__table-wrap">
          <table className="employee-list-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Code</th>
                <th scope="col">Role</th>
                <th scope="col">Site</th>
                <th scope="col">Phone</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="employee-list-table__empty">
                    No employees match your filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className={
                      onSelectEmployee
                        ? "employee-list-table__row--clickable"
                        : undefined
                    }
                    onClick={
                      onSelectEmployee
                        ? () => onSelectEmployee(employee.id)
                        : undefined
                    }
                  >
                    <td>{employee.fullName}</td>
                    <td>{employee.employeeCode}</td>
                    <td>{ROLE_LABELS[employee.role]}</td>
                    <td>{employee.assignedSite}</td>
                    <td>{employee.phone}</td>
                    <td>
                      <span
                        className={`employee-list-table__status employee-list-table__status--${employee.status}`}
                      >
                        {STATUS_LABELS[employee.status]}
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
