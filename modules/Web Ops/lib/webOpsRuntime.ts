import type { Firestore } from "firebase/firestore";
import type { GetIdToken } from "./adminApi";

type Runtime = {
  getIdToken: GetIdToken;
  db: Firestore | null;
};

let runtime: Runtime = {
  getIdToken: async () => null,
  db: null,
};

/** Bound by WebOpsProvider so non-React API modules can auth. */
export function bindWebOpsRuntime(next: Runtime): void {
  runtime = next;
}

export function webOpsGetIdToken(): Promise<string | null> {
  return runtime.getIdToken();
}

export function webOpsDb(): Firestore {
  if (!runtime.db) {
    throw new Error("Web Ops Firestore is not bound. Wrap the app in WebOpsProvider.");
  }
  return runtime.db;
}
