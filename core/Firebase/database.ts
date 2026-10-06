import type { Firestore } from "firebase/firestore";

export class DatabaseService {
  private readonly db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  get instance(): Firestore {
    return this.db;
  }
}
