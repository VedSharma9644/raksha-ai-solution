import { useState } from "react";
import type { GuardInventoryAssignment } from "@raskha/inventory-management";
import type { BranchInventoryRow } from "../../inventory/inventoryHooks";
import "./GuardInventoryPanel.css";

export interface GuardInventoryPanelProps {
  assignments: GuardInventoryAssignment[];
  /** Branch inventory rows — show only items with available stock for this branch */
  inventoryRows: BranchInventoryRow[];
  isLoading?: boolean;
  isSaving?: boolean;
  error?: string;
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

export function GuardInventoryPanel({
  assignments,
  inventoryRows,
  isLoading = false,
  isSaving = false,
  error,
  onAssign,
  onUpdateQty,
  onRemove,
}: GuardInventoryPanelProps) {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("1");

  const selectedRow = inventoryRows.find((r) => r.itemId === selectedItemId);
  const assignedItemIds = new Set(assignments.map((a) => a.itemId));
  // Already-assigned items are edited via quantity on the row — don't re-add
  const assignableRows = inventoryRows.filter(
    (r) => r.availableStock > 0 && !assignedItemIds.has(r.itemId),
  );

  async function handleAdd() {
    if (!selectedItemId || !selectedRow) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;
    await onAssign(
      selectedRow.itemId,
      selectedRow.name,
      selectedRow.category,
      selectedRow.unit,
      qty,
    );
    setSelectedItemId("");
    setQuantity("1");
  }

  return (
    <div className="guard-inventory-panel">
      <h3 className="guard-inventory-panel__title">Assigned Inventory</h3>

      {error && (
        <p className="guard-inventory-panel__error">{error}</p>
      )}

      {isLoading ? (
        <p className="guard-inventory-panel__loading">Loading…</p>
      ) : assignments.length === 0 ? (
        <p className="guard-inventory-panel__empty">
          No items assigned yet.
        </p>
      ) : (
        <ul className="guard-inventory-panel__list">
          {assignments.map((a) => (
            <li key={a.id} className="guard-inventory-panel__item">
              <span className="guard-inventory-panel__item-name">
                {a.itemName}
                <span className="guard-inventory-panel__item-category">
                  {a.category}
                </span>
              </span>
              <div className="guard-inventory-panel__item-controls">
                <input
                  type="number"
                  className="guard-inventory-panel__qty-input"
                  min={1}
                  value={a.quantity}
                  disabled={isSaving}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      void onUpdateQty(a.id, val);
                    }
                  }}
                />
                <span className="guard-inventory-panel__item-unit">{a.unit}</span>
                <button
                  type="button"
                  className="guard-inventory-panel__remove-btn"
                  disabled={isSaving}
                  onClick={() => void onRemove(a.id)}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Add item row ── */}
      {assignableRows.length === 0 ? (
        <p className="guard-inventory-panel__no-stock">
          {assignedItemIds.size > 0
            ? "All available items are already assigned. Change the quantity on a row above to issue more."
            : "No stock available for this branch yet. Ask an agency admin to allocate items to this branch from the Admin Panel inventory first."}
        </p>
      ) : (
      <div className="guard-inventory-panel__add-row">
        <select
          className="guard-inventory-panel__select"
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          disabled={isSaving}
        >
          <option value="">Select item…</option>
          {assignableRows.map((row) => (
            <option key={row.itemId} value={row.itemId}>
              {row.name} — Available: {row.availableStock} {row.unit}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="guard-inventory-panel__qty-input"
          min={1}
          max={selectedRow ? selectedRow.availableStock : undefined}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={isSaving || !selectedItemId}
          placeholder="Qty"
        />
        <button
          type="button"
          className="guard-inventory-panel__add-btn"
          disabled={
            isSaving ||
            !selectedItemId ||
            !quantity ||
            parseInt(quantity, 10) <= 0 ||
            (selectedRow ? parseInt(quantity, 10) > selectedRow.availableStock : false)
          }
          onClick={() => void handleAdd()}
        >
          {isSaving ? "…" : "Add"}
        </button>
      </div>
      )}
      {selectedRow && parseInt(quantity, 10) > selectedRow.availableStock && (
        <p className="guard-inventory-panel__warn">
          Only {selectedRow.availableStock} {selectedRow.unit} available in this branch.
        </p>
      )}
    </div>
  );
}
