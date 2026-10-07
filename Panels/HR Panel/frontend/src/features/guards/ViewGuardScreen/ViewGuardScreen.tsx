import type { Guard } from "@raskha/guard-management";
import type { GuardInventoryAssignment, InventoryItem } from "@raskha/inventory-management";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { GuardInventoryPanel } from "../GuardInventoryPanel";
import "./ViewGuardScreen.css";

export interface ViewGuardScreenProps {
  guard: Guard;
  assignments: GuardInventoryAssignment[];
  inventoryItems: InventoryItem[];
  isAssignmentsLoading?: boolean;
  isSaving?: boolean;
  assignError?: string;
  onBack: () => void;
  onAssign: (
    itemId: string,
    itemName: string,
    category: string,
    unit: string,
    quantity: number,
  ) => void | Promise<void>;
  onUpdateQty: (assignmentId: string, newQuantity: number) => void | Promise<void>;
  onRemove: (assignmentId: string) => void | Promise<void>;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  inactive: "Inactive",
};

const STATUS_COLORS: Record<string, string> = {
  active: "view-guard-screen__status--active",
  on_leave: "view-guard-screen__status--on_leave",
  inactive: "view-guard-screen__status--inactive",
};

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
}

export function ViewGuardScreen({
  guard,
  assignments,
  inventoryItems,
  isAssignmentsLoading = false,
  isSaving = false,
  assignError,
  onBack,
  onAssign,
  onUpdateQty,
  onRemove,
}: ViewGuardScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content view-guard-screen">
        <PageHeader
          title="Guard Profile"
          subtitle="View guard details and manage inventory assignments."
          onBack={onBack}
          backLabel="Back to guard list"
        />

        {/* ── Profile Hero ── */}
        <div className="view-guard-screen__hero">
          <div className="view-guard-screen__hero-avatar">
            {guard.profilePictureUrl ? (
              <img
                src={guard.profilePictureUrl}
                alt={guard.fullName}
                className="view-guard-screen__avatar-img"
              />
            ) : (
              <div className="view-guard-screen__avatar-initials">
                {getInitials(guard.fullName)}
              </div>
            )}
          </div>
          <div className="view-guard-screen__hero-info">
            <h2 className="view-guard-screen__hero-name">{guard.fullName}</h2>
            <p className="view-guard-screen__hero-sub">
              {guard.post}{guard.post && guard.employeeCode ? " · " : ""}{guard.employeeCode}
            </p>
            <span className={`view-guard-screen__status ${STATUS_COLORS[guard.status] ?? ""}`}>
              {STATUS_LABELS[guard.status] ?? guard.status}
            </span>
          </div>
        </div>

        <div className="view-guard-screen__info-grid">
          <InfoRow label="Employee Code" value={guard.employeeCode} />
          <InfoRow label="Phone" value={guard.phone} />
          <InfoRow label="Email" value={guard.email} />
          <InfoRow label="Post" value={guard.post} />
          <InfoRow label="Joining Date" value={guard.joiningDate} />
          <InfoRow label="Status" value={STATUS_LABELS[guard.status] ?? guard.status} />
        </div>

        <div className="view-guard-screen__inventory-section">
          <GuardInventoryPanel
            assignments={assignments}
            inventoryItems={inventoryItems}
            isLoading={isAssignmentsLoading}
            isSaving={isSaving}
            error={assignError}
            onAssign={onAssign}
            onUpdateQty={onUpdateQty}
            onRemove={onRemove}
          />
        </div>
      </div>
    </AppScreenLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="view-guard-screen__info-row">
      <span className="view-guard-screen__info-label">{label}</span>
      <span className="view-guard-screen__info-value">{value || "—"}</span>
    </div>
  );
}

export interface ViewGuardScreenProps {
  guard: Guard;
  assignments: GuardInventoryAssignment[];
  inventoryItems: InventoryItem[];
  isAssignmentsLoading?: boolean;
  isSaving?: boolean;
  assignError?: string;
  onBack: () => void;
  onAssign: (
    itemId: string,
    itemName: string,
    category: string,
    unit: string,
    quantity: number,
  ) => void | Promise<void>;
  onUpdateQty: (assignmentId: string, newQuantity: number) => void | Promise<void>;
  onRemove: (assignmentId: string) => void | Promise<void>;
}

export function ViewGuardScreen({
  guard,
  assignments,
  inventoryItems,
  isAssignmentsLoading = false,
  isSaving = false,
  assignError,
  onBack,
  onAssign,
  onUpdateQty,
  onRemove,
}: ViewGuardScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content view-guard-screen">
        <PageHeader
          title={guard.fullName}
          subtitle={`${guard.post} · Code: ${guard.employeeCode} · ${guard.phone}`}
          onBack={onBack}
          backLabel="Back to guard list"
        />

        <div className="view-guard-screen__info-grid">
          <InfoRow label="Employee Code" value={guard.employeeCode} />
          <InfoRow label="Phone" value={guard.phone} />
          <InfoRow label="Email" value={guard.email} />
          <InfoRow label="Post" value={guard.post} />
          <InfoRow label="Joining Date" value={guard.joiningDate} />
          <InfoRow label="Status" value={guard.status} />
        </div>

        <div className="view-guard-screen__inventory-section">
          <GuardInventoryPanel
            assignments={assignments}
            inventoryItems={inventoryItems}
            isLoading={isAssignmentsLoading}
            isSaving={isSaving}
            error={assignError}
            onAssign={onAssign}
            onUpdateQty={onUpdateQty}
            onRemove={onRemove}
          />
        </div>
      </div>
    </AppScreenLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="view-guard-screen__info-row">
      <span className="view-guard-screen__info-label">{label}</span>
      <span className="view-guard-screen__info-value">{value || "—"}</span>
    </div>
  );
}
