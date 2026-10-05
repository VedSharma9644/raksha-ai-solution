import { Firestore } from "firebase/firestore";

export class DatabaseService {
  constructor(private readonly db: Firestore) {}

  get instance(): Firestore {
    return this.db;
  }
}