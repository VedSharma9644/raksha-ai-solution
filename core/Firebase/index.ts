import { FirebaseConfig, createFirebaseApp } from "./config";
import { createFirebaseAuth } from "./auth";
import { createFirestore } from "./firestore";
import { createFirebaseStorage } from "./storage";
import { DatabaseService } from "./database";

export function initializeFirebase(config: FirebaseConfig) {
  const app = createFirebaseApp(config);
  const db = createFirestore(app);

  return {
    app,
    auth: createFirebaseAuth(app),
    db,
    database: new DatabaseService(db),
    storage: createFirebaseStorage(app),
  };
}