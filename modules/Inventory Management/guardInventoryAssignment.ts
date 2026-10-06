import type { Timestamp } from "firebase/firestore";

export interface GuardInventoryAssignment {
  id: string;
  agencyId: string;
  guardId: string;

  itemId: string;
  itemName: string;   // denormalized for fast display
  category: string;   // denormalized
  unit: string;       // denormalized

  quantity: number;

  assignedAt: Timestamp;
  updatedAt: Timestamp;
}

export const GUARD_INVENTORY_ASSIGNMENT_COLLECTION = "guardInventoryAssignments";
