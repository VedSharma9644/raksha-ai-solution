import {
    getStorage,
    FirebaseStorage
  } from "firebase/storage";
  import { FirebaseApp } from "firebase/app";
  
  export function createFirebaseStorage(
    app: FirebaseApp
  ): FirebaseStorage {
    return getStorage(app);
  }