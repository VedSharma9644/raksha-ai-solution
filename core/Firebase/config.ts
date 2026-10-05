import { initializeApp, FirebaseApp } from "firebase/app";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function createFirebaseApp(config: FirebaseConfig): FirebaseApp {
  return initializeApp(config);
}