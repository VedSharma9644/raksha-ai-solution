import { useMemo, useState } from "react";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import type { ReliefRequest, ReliefRequestStatus } from "../reliefTypes";
import "./ReliefManagementScreen.css";

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export type ReliefAssigneeOption = {
  id: string;
  fullName: string;
  employeeCode: string;
};

export interface ReliefManagementScreenProps {
  reliefRequests: ReliefRequest[];
  assignees: ReliefAssigneeOption[];
  onBack: () => void;
  onUpdateStatus: (
    reliefId: string,
    status: ReliefRequestStatus,
    assignedGuardId?: string,
  ) => void;
  isLoading?: boolean;
  error?: string | null;
  updatingId?: string | null;
}

export function ReliefManagementScreen({
  reliefRequests,
  assignees,
  onBack,
  onUpdateStatus,
  isLoading = false,
  error = null,
  updatingId = null,
}: ReliefManagementScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeByRequest, setAssigneeByRequest] = useState<
    Record<string, string>
  >({});

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return reliefRequests.filter((request) => {
      const matchesQuery =
        query.length === 0 ||
        request.guardName.toLowerCase().includes(query) ||
        request.employeeCode.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter.length === 0 || request.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [reliefRequests, searchQuery, statusFilter]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content relief-management-screen">
        <PageHeader
          title="Manage Relief"
          subtitle="Review remaining-shift handovers and assign a replacement guard."
          onBack={onBack}
          backLabel="Back to dashboard"
        />

        <div className="relief-management-screen__filters">
          <TextField
            label="Search"
            name="reliefSearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Guard name or code"
          />
          <SelectField
            label="Status"
            name="reliefStatus"
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
          <p
            className="relief-management-screen__empty"
            style={{ color: "#b91c1c" }}
          >
            {error}
          </p>
        ) : null}

        <div className="relief-management-screen__list">
          {isLoading ? (
            <p className="relief-management-screen__empty">
              Loading relief requests…
            </p>
          ) : filteredRequests.length === 0 ? (
            <p className="relief-management-screen__empty">
              No relief requests match your filters.
            </p>
          ) : (
            filteredRequests.map((request) => {
              const busy = updatingId === request.id;
              const selectedAssignee =
                assigneeByRequest[request.id] ?? request.assignedGuardId ?? "";
              const eligibleAssignees = assignees.filter(
                (guard) => guard.id !== request.guardId,
              );

              return (
                <article key={request.id} className="relief-request-card">
                  <div className="relief-request-card__header">
                    <div>
                      <h2 className="relief-request-card__name">
                        {request.guardName}
                      </h2>
                      <p className="relief-request-card__meta">
                        {request.employeeCode} · {request.methodLabel}
                      </p>
                    </div>
                    <span
                      className={`relief-request-card__status relief-request-card__status--${request.status}`}
                    >
                      {STATUS_LABELS[request.status]}
                    </span>
                  </div>

                  <p className="relief-request-card__dates">
                    {request.dutyDate} · {request.shiftFrom} – {request.shiftTo}
                    {request.handoverFrom
                      ? ` · from ${new Date(request.handoverFrom).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                      : ""}
                  </p>
                  <p className="relief-request-card__reason">
                    {request.siteName}
                    {request.postName ? ` · ${request.postName}` : ""}
                  </p>
                  <p className="relief-request-card__reason">
                    Reason: {request.reasonLabel}
                    {request.note ? ` — ${request.note}` : ""}
                  </p>
                  {request.assignedGuardName ? (
                    <p className="relief-request-card__reason">
                      Assigned: {request.assignedGuardName}
                    </p>
                  ) : null}

                  {request.status === "pending" ? (
                    <>
                      <div className="relief-request-card__assign">
                        <label htmlFor={`assignee-${request.id}`}>
                          Assign replacement guard
                        </label>
                        <select
                          id={`assignee-${request.id}`}
                          value={selectedAssignee}
                          onChange={(event) =>
                            setAssigneeByRequest((current) => ({
                              ...current,
                              [request.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select guard…</option>
                          {eligibleAssignees.map((guard) => (
                            <option key={guard.id} value={guard.id}>
                              {guard.fullName} ({guard.employeeCode})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="relief-request-card__actions">
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
                          disabled={busy || !selectedAssignee}
                          onClick={() =>
                            onUpdateStatus(
                              request.id,
                              "approved",
                              selectedAssignee,
                            )
                          }
                        >
                          {busy ? "Saving…" : "Approve & assign"}
                        </Button>
                      </div>
                    </>
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
