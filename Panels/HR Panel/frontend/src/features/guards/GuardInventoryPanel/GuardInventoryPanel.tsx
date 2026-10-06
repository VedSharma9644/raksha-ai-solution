import { useState } from "react";
import type { GuardInventoryAssignment, InventoryItem } from "@raskha/inventory-management";
import "./GuardInventoryPanel.css";

export interface GuardInventoryPanelProps {
  assignments: GuardInventoryAssignment[];
  inventoryItems: InventoryItem[];
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
  inventoryItems,
  isLoading = false,
  isSaving = false,
  error,
  onAssign,
  onUpdateQty,
  onRemove,
}: GuardInventoryPanelProps) {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("1");

  // Compute availableStock for each item
  const itemsWithAvailable = inventoryItems.map((item) => ({
    ...item,
    availableStock: item.totalStock - (item.assignedStock ?? 0),
  }));

  const selectedItem = itemsWithAvailable.find((i) => i.id === selectedItemId);

  async function handleAdd() {
    if (!selectedItemId || !selectedItem) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;
    await onAssign(
      selectedItem.id,
      selectedItem.name,
      selectedItem.category,
      selectedItem.unit,
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
      <div className="guard-inventory-panel__add-row">
        <select
          className="guard-inventory-panel__select"
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          disabled={isSaving || inventoryItems.length === 0}
        >
          <option value="">Select item…</option>
          {itemsWithAvailable.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — Available: {item.availableStock} {item.unit}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="guard-inventory-panel__qty-input"
          min={1}
          max={selectedItem ? selectedItem.availableStock : undefined}
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
            (selectedItem ? parseInt(quantity, 10) > selectedItem.availableStock : false)
          }
          onClick={() => void handleAdd()}
        >
          {isSaving ? "…" : "Add"}
        </button>
      </div>
      {selectedItem && parseInt(quantity, 10) > selectedItem.availableStock && (
        <p className="guard-inventory-panel__warn">
          Only {selectedItem.availableStock} {selectedItem.unit} available.
        </p>
      )}
    </div>
  );
}
