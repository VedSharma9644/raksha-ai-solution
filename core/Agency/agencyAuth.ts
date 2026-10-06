import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { Auth, UserCredential } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { AGENCIES_COLLECTION } from "./agency";
import type { Agency, AgencyPlan, AgencyStatus } from "./agency";

export interface CreateAgencyParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  plan: AgencyPlan;
  logo: string;
  ownerName: string;
}

export interface SignInAgencyParams {
  email: string;
  password: string;
}

export async function createAgencyAccount(
  auth: Auth,
  db: Firestore,
  params: CreateAgencyParams
): Promise<Agency> {
  const { name, email, password, phone, address, plan, logo, ownerName } = params;

  // Create Firebase Auth user
  const credential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const uid = credential.user.uid;

  // Build agency document
  const agencyData = {
    id: uid,
    name,
    email,
    phone,
    address,
    plan,
    logo,
    ownerName,
    status: "active" as AgencyStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Save to Firestore
  await setDoc(doc(db, AGENCIES_COLLECTION, uid), agencyData);

  console.log(`Agency "${name}" created successfully with id: ${uid}`);

  return agencyData as unknown as Agency;
}

export async function signInAgency(
  auth: Auth,
  params: SignInAgencyParams
): Promise<UserCredential> {
  const { email, password } = params;
  const credential = await signInWithEmailAndPassword(auth, email, password);
  console.log(`Agency signed in: ${email}`);
  return credential;
}

export async function getAgencyById(
  db: Firestore,
  agencyId: string,
  options?: { fromServer?: boolean }
): Promise<Agency | null> {
  const ref = doc(db, AGENCIES_COLLECTION, agencyId);
  const snapshot = options?.fromServer
    ? await getDocFromServer(ref)
    : await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Agency;
  return { ...data, id: data.id || snapshot.id };
}

export interface LoginAgencyParams {
  email: string;
  password: string;
}

export interface LoginAgencyResult {
  credential: UserCredential;
  agency: Agency;
}

export async function loginAgency(
  auth: Auth,
  db: Firestore,
  params: LoginAgencyParams
): Promise<LoginAgencyResult> {
  const { email, password } = params;

  // Step 1: Firebase Auth sign-in
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // Step 2: Verify agency exists in Firestore (server read — avoid stale cache)
  const agency = await getAgencyById(db, uid, { fromServer: true });

  if (!agency) {
    await signOut(auth);
    throw new Error("Account not found");
  }

  // Step 3: Verify agency is active
  if (agency.status !== "active") {
    await signOut(auth);
    throw new Error("Account is inactive");
  }

  return { credential, agency };
}
