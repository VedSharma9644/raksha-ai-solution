import {
    getAuth,
    Auth
  } from "firebase/auth";
  import { FirebaseApp } from "firebase/app";
  
  export function createFirebaseAuth(app: FirebaseApp): Auth {
    return getAuth(app);
  }