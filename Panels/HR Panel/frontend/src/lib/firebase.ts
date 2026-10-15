import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { resolveBrowserAuthDomain } from "@raskha/core";
import { configureAdminApi } from "@raskha/shared";

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: resolveBrowserAuthDomain(
    "hr",
    import.meta.env.FIREBASE_AUTH_DOMAIN
  ),
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/** Config for secondary Auth apps if ever needed. */
export const clientFirebaseConfig = firebaseConfig;

// Bind Admin API client once (HR uses the same Admin backend).
configureAdminApi({
  getIdToken: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  },
});
