import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { FirebaseApp } from "firebase/app";

export function createFirestore(app: FirebaseApp): Firestore {
  return getFirestore(app);
}
