import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import type { AgencyListItem } from "../agencyTypes";
import "./AgencyListScreen.css";

const STATUS_LABELS = {
  active: "Active",
  trial: "Trial",
  suspended: "Suspended",
} as const;

export interface AgencyListScreenProps {
  agencies: AgencyListItem[];
  onBack: () => void;
  onSelectAgency?: (agencyId: string) => void;
}

export function AgencyListScreen({
  agencies,
  onBack,
  onSelectAgency,
}: AgencyListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredAgencies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return agencies.filter((agency) => {
      const matchesQuery =
        query.length === 0 ||
        agency.agencyName.toLowerCase().includes(query) ||
        agency.city.toLowerCase().includes(query) ||
        agency.contactPerson.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter.length === 0 || agency.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [agencies, searchQuery, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content agency-list-screen">
        <PageHeader
          title="Agencies"
          subtitle="Every company on the Raskha platform under your control."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="agency-list-screen__filters">
          <TextField
            label="Search"
            name="agencySearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Agency, city, or contact"
          />
          <SelectField
            label="Status"
            name="agencyStatus"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="All statuses"
            options={[
              { value: "active", label: "Active" },
              { value: "trial", label: "Trial" },
              { value: "suspended", label: "Suspended" },
            ]}
          />
        </div>

        <div className="agency-list-screen__table-wrap">
          <table className="agency-list-table">
            <thead>
              <tr>
                <th scope="col">Agency</th>
                <th scope="col">Contact</th>
                <th scope="col">City</th>
                <th scope="col">Plan</th>
                <th scope="col">Features</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="agency-list-table__empty">
                    No agencies match your filters.
                  </td>
                </tr>
              ) : (
                filteredAgencies.map((agency) => (
                  <tr
                    key={agency.id}
                    className={
                      onSelectAgency
                        ? "agency-list-table__row--clickable"
                        : undefined
                    }
                    onClick={
                      onSelectAgency
                        ? () => onSelectAgency(agency.id)
                        : undefined
                    }
                  >
                    <td>
                      <div className="agency-list-table__primary">
                        {agency.agencyName}
                      </div>
                      <div className="agency-list-table__secondary">
                        {agency.email}
                      </div>
                    </td>
                    <td>{agency.contactPerson}</td>
                    <td>{agency.city}</td>
                    <td>{agency.planName}</td>
                    <td>{agency.enabledFeatureCount}</td>
                    <td>
                      <span
                        className={`agency-list-table__status agency-list-table__status--${agency.status}`}
                      >
                        {STATUS_LABELS[agency.status]}
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
