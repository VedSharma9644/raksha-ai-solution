import { useEffect, useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import { ToggleSwitch } from "../../../components/ToggleSwitch";
import type { AgencyListItem } from "../agencyTypes";
import "./AgencyListScreen.css";

export interface AgencyListScreenProps {
  agencies: AgencyListItem[];
  isLoading?: boolean;
  listError?: string;
  onBack: () => void;
  onEditAgency?: (agencyId: string) => void;
  onOpenModules?: (agencyId: string) => void;
  onRequestDelete?: (agencyId: string) => void;
  onToggleAgencyActive?: (agencyId: string, active: boolean) => void;
  statusUpdatingId?: string | null;
  deletePendingAgencyId?: string | null;
  deleteNotified?: string;
  deleteDebugOtp?: string;
  deleteError?: string;
  isDeleteRequesting?: boolean;
  isDeleteConfirming?: boolean;
  onConfirmDelete?: (otp: string) => void | Promise<void>;
  onCancelDelete?: () => void;
}

export function AgencyListScreen({
  agencies,
  isLoading = false,
  listError = "",
  onBack,
  onEditAgency,
  onOpenModules,
  onRequestDelete,
  onToggleAgencyActive,
  statusUpdatingId = null,
  deletePendingAgencyId = null,
  deleteNotified = "",
  deleteDebugOtp = "",
  deleteError = "",
  isDeleteRequesting = false,
  isDeleteConfirming = false,
  onConfirmDelete,
  onCancelDelete,
}: AgencyListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!deletePendingAgencyId) setOtp("");
  }, [deletePendingAgencyId]);

  const filteredAgencies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return agencies.filter((agency) => {
      const isActive = agency.status === "active";
      const matchesQuery =
        query.length === 0 ||
        agency.agencyName.toLowerCase().includes(query) ||
        agency.city.toLowerCase().includes(query) ||
        agency.contactPerson.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter.length === 0 ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "paused" && !isActive);

      return matchesQuery && matchesStatus;
    });
  }, [agencies, searchQuery, statusFilter]);

  const pendingAgency = agencies.find((a) => a.id === deletePendingAgencyId);

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
              { value: "paused", label: "Paused" },
            ]}
          />
        </div>

        {listError ? (
          <p className="agency-list-screen__error" role="alert">
            {listError}
          </p>
        ) : null}

        <div className="agency-list-screen__table-wrap">
          <table className="agency-list-table">
            <thead>
              <tr>
                <th scope="col">Agency</th>
                <th scope="col">Contact</th>
                <th scope="col">City</th>
                <th scope="col">Plan</th>
                <th scope="col">Modules</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="agency-list-table__empty">
                    Loading agencies…
                  </td>
                </tr>
              ) : filteredAgencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="agency-list-table__empty">
                    No agencies match your filters.
                  </td>
                </tr>
              ) : (
                filteredAgencies.map((agency) => {
                  const isActive = agency.status === "active";
                  return (
                    <tr key={agency.id}>
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
                      <td>
                        {onOpenModules ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="medium"
                            onClick={() => onOpenModules(agency.id)}
                          >
                            Modules
                          </Button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="agency-list-table__toggle-cell">
                        <ToggleSwitch
                          label={isActive ? "Active" : "Paused"}
                          checked={isActive}
                          disabled={statusUpdatingId === agency.id}
                          onChange={(enabled) =>
                            onToggleAgencyActive?.(agency.id, enabled)
                          }
                        />
                      </td>
                      <td className="agency-list-table__actions">
                        {onEditAgency ? (
                          <button
                            type="button"
                            className="agency-icon-btn agency-icon-btn--edit"
                            aria-label={`Edit ${agency.agencyName}`}
                            title="Edit agency"
                            onClick={() => onEditAgency(agency.id)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              aria-hidden="true"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>
                        ) : null}
                        {onRequestDelete ? (
                          <button
                            type="button"
                            className="agency-icon-btn agency-icon-btn--remove"
                            aria-label={`Remove ${agency.agencyName}`}
                            title="Remove agency"
                            onClick={() => onRequestDelete(agency.id)}
                            disabled={isDeleteRequesting}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              aria-hidden="true"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {deletePendingAgencyId ? (
          <div className="agency-delete-otp" role="dialog" aria-modal="true">
            <div className="agency-delete-otp__panel">
              <h2 className="agency-delete-otp__title">Confirm agency removal</h2>
              <p className="agency-delete-otp__copy">
                An OTP was sent to{" "}
                <strong>{deleteNotified || "the Super Admin email"}</strong>
                {pendingAgency ? (
                  <>
                    {" "}
                    to permanently delete{" "}
                    <strong>{pendingAgency.agencyName}</strong>.
                  </>
                ) : (
                  "."
                )}
              </p>
              {deleteDebugOtp ? (
                <p className="agency-delete-otp__debug">
                  Dev OTP: <code>{deleteDebugOtp}</code>
                </p>
              ) : null}
              <TextField
                label="6-digit OTP"
                name="deleteOtp"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              {deleteError ? (
                <p className="agency-list-screen__error" role="alert">
                  {deleteError}
                </p>
              ) : null}
              <div className="agency-delete-otp__actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancelDelete}
                  disabled={isDeleteConfirming}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => onConfirmDelete?.(otp.trim())}
                  disabled={isDeleteConfirming || otp.trim().length !== 6}
                >
                  {isDeleteConfirming ? "Deleting…" : "Confirm delete"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppScreenLayout>
  );
}
