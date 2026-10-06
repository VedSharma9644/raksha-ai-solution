import type { Timestamp } from "firebase/firestore";

export type FeatureStatus = "active" | "inactive";

export interface Feature {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  dependencies: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const FEATURES_COLLECTION = "features";
