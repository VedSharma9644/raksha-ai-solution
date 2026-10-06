import { getStorage } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";
import type { FirebaseApp } from "firebase/app";

export function createFirebaseStorage(app: FirebaseApp): FirebaseStorage {
  return getStorage(app);
}
