import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { resolveBrowserAuthDomain } from "@raskha/core";

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: resolveBrowserAuthDomain(
    "agencyAdmin",
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

/** Config for secondary Auth apps (e.g. creating HR users without signing out admin). */
export const clientFirebaseConfig = firebaseConfig;
