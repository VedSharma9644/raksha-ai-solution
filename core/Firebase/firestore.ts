import {
    getFirestore,
    Firestore
  } from "firebase/firestore";
  import { FirebaseApp } from "firebase/app";
  
  export function createFirestore(app: FirebaseApp): Firestore {
    return getFirestore(app);
  }