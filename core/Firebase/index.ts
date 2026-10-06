import type { FirebaseConfig } from "./config";
import { createFirebaseApp } from "./config";
import { createFirebaseAuth } from "./auth";
import { createFirestore } from "./firestore";
import { createFirebaseStorage } from "./storage";
import { DatabaseService } from "./database";

export type { FirebaseConfig } from "./config";
export {
  PANEL_ORIGINS,
  panelAuthDomain,
  resolveBrowserAuthDomain,
  panelActionCodeSettings,
  getCorsAllowedOrigins,
  isAllowedCorsOrigin,
} from "./panelOrigins";
export type { PanelKey } from "./panelOrigins";

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
