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
