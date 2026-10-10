import { useState } from "react";
import type { InventoryItem } from "@raskha/inventory-management";
import type { BranchStock } from "@raskha/branch-stock";
import type { Branch } from "@raskha/branch-management";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import "./BranchStockScreen.css";

const STATUS_LABELS = {
  in_stock:     "In Stock",
  low_stock:    "Low Stock",
  out_of_stock: "Out of Stock",
} as const;

export interface AllocatePayload {
  branchId: string;
  itemId: string;
  itemName: string;
  category: string;
  unit: string;
  allocatedStock: number;
  thresholdStock: number;
}

export interface BranchStockScreenProps {
  item: InventoryItem;
  branches: Branch[];
  branchStocks: BranchStock[];
  isLoading?: boolean;
  isSaving?: boolean;
  saveError?: string;
  onBack: () => void;
  onAllocate: (payload: AllocatePayload) => void | Promise<void>;
}

export function BranchStockScreen({
  item,
  branches,
  branchStocks,
  isLoading = false,
  isSaving = false,
  saveError,
  onBack,
  onAllocate,
}: BranchStockScreenProps) {
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [allocatedInput, setAllocatedInput]   = useState("");
  const [thresholdInput, setThresholdInput]   = useState("");

  // Merge branches with their stock records
  const rows = branches.map((branch) => {
    const stock = branchStocks.find((s) => s.branchId === branch.id);
    return { branch, stock };
  });

  const totalAllocated = branchStocks.reduce((sum, s) => sum + s.allocatedStock, 0);
  const totalAssigned  = branchStocks.reduce((sum, s) => sum + s.assignedStock, 0);

  function startEdit(branchId: string, stock?: BranchStock) {
    setEditingBranchId(branchId);
    setAllocatedInput(String(stock?.allocatedStock ?? 0));
    setThresholdInput(String(stock?.thresholdStock ?? 5));
  }

  function cancelEdit() {
    setEditingBranchId(null);
  }

  async function handleSave(branchId: string) {
    await onAllocate({
      branchId,
      itemId:         item.id,
      itemName:       item.name,
      category:       item.category,
      unit:           item.unit,
      allocatedStock: Number(allocatedInput) || 0,
      thresholdStock: Number(thresholdInput) || 0,
    });
    setEditingBranchId(null);
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content branch-stock-screen">
        <PageHeader
          title={`Branch Distribution — ${item.name}`}
          subtitle={`Category: ${item.category} · Unit: ${item.unit} · Total Agency Stock: ${item.totalStock}`}
          onBack={onBack}
          backLabel="Back to inventory"
        />

        {/* Summary row */}
        <div className="branch-stock-screen__summary">
          <div className="branch-stock-screen__summary-card">
            <span className="branch-stock-screen__summary-label">Total Agency Stock</span>
            <span className="branch-stock-screen__summary-value">{item.totalStock}</span>
          </div>
          <div className="branch-stock-screen__summary-card">
            <span className="branch-stock-screen__summary-label">Total Allocated to Branches</span>
            <span className="branch-stock-screen__summary-value">{totalAllocated}</span>
          </div>
          <div className="branch-stock-screen__summary-card">
            <span className="branch-stock-screen__summary-label">Total Assigned to Guards</span>
            <span className="branch-stock-screen__summary-value">{totalAssigned}</span>
          </div>
          <div className="branch-stock-screen__summary-card">
            <span className="branch-stock-screen__summary-label">Unallocated</span>
            <span className="branch-stock-screen__summary-value branch-stock-screen__summary-value--accent">
              {item.totalStock - totalAllocated}
            </span>
          </div>
        </div>

        {saveError && (
          <p className="branch-stock-screen__error">{saveError}</p>
        )}

        {isLoading ? (
          <p className="branch-stock-screen__loading">Loading branch stock…</p>
        ) : (
          <div className="branch-stock-screen__table-wrap">
            <table className="branch-stock-table">
              <thead>
                <tr>
                  <th scope="col">Branch</th>
                  <th scope="col">City</th>
                  <th scope="col">Allocated</th>
                  <th scope="col">Assigned to Guards</th>
                  <th scope="col">Available</th>
                  <th scope="col">Threshold</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="branch-stock-table__empty">
                      No branches found. Add branches first.
                    </td>
                  </tr>
                ) : (
                  rows.map(({ branch, stock }) => {
                    const isEditing  = editingBranchId === branch.id;
                    const allocated  = stock?.allocatedStock ?? 0;
                    const assigned   = stock?.assignedStock ?? 0;
                    const available  = allocated - assigned;
                    const status     = stock?.status ?? "out_of_stock";

                    return (
                      <tr key={branch.id} className={isEditing ? "branch-stock-table__row--editing" : undefined}>
                        <td className="branch-stock-table__name">{branch.name}</td>
                        <td>{branch.city ?? "—"}</td>

                        {/* Allocated — inline input when editing */}
                        <td className="branch-stock-table__num">
                          {isEditing ? (
                            <input
                              type="number"
                              className="branch-stock-table__inline-input"
                              value={allocatedInput}
                              min={assigned}
                              onChange={(e) => setAllocatedInput(e.target.value)}
                              disabled={isSaving}
                              title={`Min: ${assigned} (already assigned)`}
                            />
                          ) : allocated}
                        </td>

                        <td className="branch-stock-table__num">{assigned}</td>

                        <td className={`branch-stock-table__num${available <= 0 ? " branch-stock-table__num--zero" : ""}`}>
                          {isEditing ? (
                            <span className="branch-stock-table__preview">
                              {Math.max(0, (Number(allocatedInput) || 0) - assigned)}
                            </span>
                          ) : available}
                        </td>

                        {/* Threshold — inline input when editing */}
                        <td className="branch-stock-table__num">
                          {isEditing ? (
                            <input
                              type="number"
                              className="branch-stock-table__inline-input"
                              value={thresholdInput}
                              min={0}
                              onChange={(e) => setThresholdInput(e.target.value)}
                              disabled={isSaving}
                            />
                          ) : (stock?.thresholdStock ?? "—")}
                        </td>

                        <td>
                          {stock ? (
                            <span className={`branch-stock-table__status branch-stock-table__status--${status}`}>
                              {STATUS_LABELS[status]}
                            </span>
                          ) : (
                            <span className="branch-stock-table__status branch-stock-table__status--none">
                              Not Set
                            </span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="branch-stock-table__actions">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                className="branch-stock-table__save-btn"
                                onClick={() => void handleSave(branch.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? "Saving…" : "Save"}
                              </button>
                              <button
                                type="button"
                                className="branch-stock-table__cancel-btn"
                                onClick={cancelEdit}
                                disabled={isSaving}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="branch-stock-table__allocate-btn"
                              onClick={() => startEdit(branch.id, stock)}
                              disabled={!!editingBranchId}
                            >
                              {stock ? "Edit Allocation" : "Allocate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="branch-stock-screen__hint">
          Set the allocated stock for each branch. HR staff then assign items to guards from their allocated pool.
        </p>
      </div>
    </AppScreenLayout>
  );
}
