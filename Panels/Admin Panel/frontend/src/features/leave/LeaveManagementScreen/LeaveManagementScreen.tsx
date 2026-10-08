import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import type { LeaveRequest, LeaveRequestStatus } from "../leaveTypes";
import "./LeaveManagementScreen.css";

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export interface LeaveManagementScreenProps {
  leaveRequests: LeaveRequest[];
  onBack: () => void;
  onUpdateStatus: (leaveId: string, status: LeaveRequestStatus) => void;
  isLoading?: boolean;
  error?: string | null;
  updatingId?: string | null;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  const end = new Date(endDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  return startDate === endDate ? start : `${start} – ${end}`;
}

export function LeaveManagementScreen({
  leaveRequests,
  onBack,
  onUpdateStatus,
  isLoading = false,
  error = null,
  updatingId = null,
}: LeaveManagementScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return leaveRequests.filter((request) => {
      const matchesQuery =
        query.length === 0 ||
        request.guardName.toLowerCase().includes(query) ||
        request.employeeCode.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter.length === 0 || request.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [leaveRequests, searchQuery, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content leave-management-screen">
        <PageHeader
          title="Manage Leave"
          subtitle="Review upcoming and pending leave requests for guards."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="leave-management-screen__filters">
          <TextField
            label="Search"
            name="leaveSearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Guard name or code"
          />
          <SelectField
            label="Status"
            name="leaveStatus"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="All statuses"
            options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        </div>

        {error ? (
          <p className="leave-management-screen__empty" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        ) : null}

        <div className="leave-management-screen__list">
          {isLoading ? (
            <p className="leave-management-screen__empty">Loading leave requests…</p>
          ) : filteredRequests.length === 0 ? (
            <p className="leave-management-screen__empty">
              No leave requests match your filters.
            </p>
          ) : (
            filteredRequests.map((request) => {
              const busy = updatingId === request.id;
              return (
                <article key={request.id} className="leave-request-card">
                  <div className="leave-request-card__header">
                    <div>
                      <h2 className="leave-request-card__name">
                        {request.guardName}
                      </h2>
                      <p className="leave-request-card__meta">
                        {request.employeeCode} · {request.leaveType}
                      </p>
                    </div>
                    <span
                      className={`leave-request-card__status leave-request-card__status--${request.status}`}
                    >
                      {STATUS_LABELS[request.status]}
                    </span>
                  </div>

                  <p className="leave-request-card__dates">
                    {formatDateRange(request.startDate, request.endDate)}
                  </p>
                  <p className="leave-request-card__reason">{request.reason}</p>

                  {request.status === "pending" ? (
                    <div className="leave-request-card__actions">
                      <Button
                        type="button"
                        variant="secondary"
                        size="medium"
                        disabled={busy}
                        onClick={() => onUpdateStatus(request.id, "rejected")}
                      >
                        {busy ? "Saving…" : "Reject"}
                      </Button>
                      <Button
                        type="button"
                        size="medium"
                        disabled={busy}
                        onClick={() => onUpdateStatus(request.id, "approved")}
                      >
                        {busy ? "Saving…" : "Approve"}
                      </Button>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>
    </AppScreenLayout>
  );
}
