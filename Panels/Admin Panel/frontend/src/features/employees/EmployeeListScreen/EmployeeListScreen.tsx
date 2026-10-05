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
