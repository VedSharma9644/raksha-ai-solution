import { randomUUID } from "node:crypto";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import {
  guardPhoneLookupVariants,
  normalizeGuardEmail,
  normalizeGuardPhone,
} from "@raskha/guard-management";

const GUARDS_COLLECTION = "guards";
const MAX_FILE_BYTES = 15 * 1024 * 1024;

export async function findGuardIdByPhoneAdmin(
  phone: string,
  excludeGuardId?: string
): Promise<string | null> {
  const db = getFirestore();
  for (const variant of guardPhoneLookupVariants(phone)) {
    const snap = await db
      .collection(GUARDS_COLLECTION)
      .where("phone", "==", variant)
      .limit(5)
      .get();
    for (const docSnap of snap.docs) {
      if (excludeGuardId && docSnap.id === excludeGuardId) continue;
      return docSnap.id;
    }
  }
  return null;
}

export async function findGuardIdByEmailAdmin(
  email: string,
  excludeGuardId?: string
): Promise<string | null> {
  const normalized = normalizeGuardEmail(email);
  if (!normalized.includes("@")) return null;
  const db = getFirestore();
  const candidates = [...new Set([normalized, String(email ?? "").trim()].filter(Boolean))];
  for (const candidate of candidates) {
    const snap = await db
      .collection(GUARDS_COLLECTION)
      .where("email", "==", candidate)
      .limit(5)
      .get();
    for (const docSnap of snap.docs) {
      if (excludeGuardId && docSnap.id === excludeGuardId) continue;
      return docSnap.id;
    }
  }
  return null;
}

export async function assertGuardContactUniqueAdmin(params: {
  phone: string;
  email: string;
  excludeGuardId?: string;
}): Promise<void> {
  const phoneDigits = normalizeGuardPhone(params.phone);
  if (phoneDigits.length < 10) {
    throw Object.assign(new Error("Enter a valid mobile number."), {
      statusCode: 400,
      code: "guard/invalid-phone",
    });
  }

  const existingPhone = await findGuardIdByPhoneAdmin(
    params.phone,
    params.excludeGuardId
  );
  if (existingPhone) {
    throw Object.assign(
      new Error("This mobile number is already registered to another guard."),
      { statusCode: 409, code: "guard/phone-taken" }
    );
  }

  const email = normalizeGuardEmail(params.email);
  if (!email) return;
  if (!email.includes("@")) {
    throw Object.assign(new Error("Enter a valid email address."), {
      statusCode: 400,
      code: "guard/invalid-email",
    });
  }

  const existingEmail = await findGuardIdByEmailAdmin(
    email,
    params.excludeGuardId
  );
  if (existingEmail) {
    throw Object.assign(
      new Error("This email is already registered to another guard."),
      { statusCode: 409, code: "guard/email-taken" }
    );
  }
}

export async function saveGuardFileAdmin(params: {
  agencyId: string;
  fileName: string;
  contentType: string;
  dataBase64: string;
}): Promise<{ url: string; name: string; contentType: string; path: string }> {
  const buffer = Buffer.from(params.dataBase64, "base64");
  if (!buffer.length) {
    throw Object.assign(new Error("File data is required."), { statusCode: 400 });
  }
  if (buffer.length > MAX_FILE_BYTES) {
    throw Object.assign(new Error("File is larger than 15 MB."), {
      statusCode: 400,
    });
  }

  const safeName =
    params.fileName.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "file";
  const storagePath = `agencies/${params.agencyId}/guards/${Date.now()}-${safeName}`;
  const contentType = params.contentType || "application/octet-stream";
  const token = randomUUID();
  const bucket = getStorage().bucket();
  const file = bucket.file(storagePath);

  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
  return {
    url,
    name: params.fileName || "Document",
    contentType,
    path: storagePath,
  };
}
