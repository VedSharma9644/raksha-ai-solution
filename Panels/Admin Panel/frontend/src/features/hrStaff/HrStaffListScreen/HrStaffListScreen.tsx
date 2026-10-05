import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { TextField } from "../../../components/TextField";
import type { HrStaff } from "@raskha/hr-management";
import "./HrStaffListScreen.css";

const STATUS_LABELS: Record<HrStaff["status"], string> = {
  active: "Active",
  inactive: "Inactive",
};

export interface HrStaffListScreenProps {
  hrStaff: HrStaff[];
  onBack: () => void;
  onAddHr: () => void;
  onSelectHr: (hrStaffId: string) => void;
}

export function HrStaffListScreen({
  hrStaff,
  onBack,
  onAddHr,
  onSelectHr,
}: HrStaffListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return hrStaff;
    return hrStaff.filter(
      (hr) =>
        hr.fullName.toLowerCase().includes(query) ||
        hr.employeeCode.toLowerCase().includes(query) ||
        hr.email.toLowerCase().includes(query)
    );
  }, [hrStaff, searchQuery]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content hr-staff-list-screen">
        <PageHeader
          title="HR User List"
          subtitle="Manage HR staff who handle leave, payroll, and staff records."
          onBack={onBack}
          backLabel="Back to dashboard"
          actions={
            <Button type="button" onClick={onAddHr}>
              + Add HR User
            </Button>
          }
        />

        <div className="hr-staff-list-screen__filters">
          <TextField
            label="Search"
            name="hrSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, code, or email"
          />
        </div>

        <div className="hr-staff-list-screen__table-wrap">
          <table className="hr-staff-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Code</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="hr-staff-table__empty">
                    No HR users found.
                  </td>
                </tr>
              ) : (
                filtered.map((hr) => (
                  <tr
                    key={hr.id}
                    className="hr-staff-table__row--clickable"
                    onClick={() => onSelectHr(hr.id)}
                  >
                    <td>{hr.fullName}</td>
                    <td>{hr.employeeCode}</td>
                    <td>{hr.email}</td>
                    <td>{hr.phone}</td>
                    <td>
                      <span
                        className={`hr-staff-table__status hr-staff-table__status--${hr.status}`}
                      >
                        {STATUS_LABELS[hr.status]}
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
