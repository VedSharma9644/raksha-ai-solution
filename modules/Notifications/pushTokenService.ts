import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

import { GUARD_PUSH_TOKENS_COLLECTION } from "./types";

export type RegisterPushTokenParams = {
  guardId: string;
  agencyId: string;
  expoPushToken: string;
  deviceId: string;
  platform?: "ios" | "android" | "web" | "unknown";
};

function tokenDocId(guardId: string, deviceId: string): string {
  const safeDevice = deviceId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "device";
  return `${guardId}_${safeDevice}`.slice(0, 700);
}

export async function registerGuardPushToken(
  params: RegisterPushTokenParams
): Promise<{ ok: true; id: string }> {
  const guardId = params.guardId.trim();
  const agencyId = params.agencyId.trim();
  const expoPushToken = params.expoPushToken.trim();
  const deviceId = params.deviceId.trim() || "unknown";

  if (!guardId || !agencyId || !expoPushToken) {
    throw Object.assign(new Error("guardId, agencyId, and expoPushToken are required."), {
      statusCode: 400,
    });
  }

  if (!expoPushToken.startsWith("ExponentPushToken[") && !expoPushToken.startsWith("ExpoPushToken[")) {
    throw Object.assign(new Error("Invalid Expo push token."), { statusCode: 400 });
  }

  const id = tokenDocId(guardId, deviceId);
  const now = Timestamp.now();
  const ref = getFirestore().collection(GUARD_PUSH_TOKENS_COLLECTION).doc(id);
  const existing = await ref.get();
  await ref.set(
    {
      guardId,
      agencyId,
      expoPushToken,
      deviceId,
      platform: params.platform ?? "unknown",
      disabled: false,
      updatedAt: now,
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  );

  return { ok: true, id };
}

export async function unregisterGuardPushToken(params: {
  guardId: string;
  deviceId?: string;
  expoPushToken?: string;
}): Promise<{ ok: true }> {
  const db = getFirestore().collection(GUARD_PUSH_TOKENS_COLLECTION);
  const guardId = params.guardId.trim();

  if (params.deviceId?.trim()) {
    await db.doc(tokenDocId(guardId, params.deviceId.trim())).set(
      { disabled: true, updatedAt: Timestamp.now() },
      { merge: true }
    );
    return { ok: true };
  }

  if (params.expoPushToken?.trim()) {
    const snap = await db
      .where("guardId", "==", guardId)
      .where("expoPushToken", "==", params.expoPushToken.trim())
      .get();
    const batch = getFirestore().batch();
    snap.docs.forEach((doc) => {
      batch.set(doc.ref, { disabled: true, updatedAt: Timestamp.now() }, { merge: true });
    });
    await batch.commit();
  }

  return { ok: true };
}

export async function listActivePushTokensForGuard(
  guardId: string
): Promise<Array<{ id: string; expoPushToken: string }>> {
  const snap = await getFirestore()
    .collection(GUARD_PUSH_TOKENS_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  return snap.docs
    .map((doc) => {
      const data = doc.data() ?? {};
      if (data.disabled === true) {
        return null;
      }
      const token = String(data.expoPushToken ?? "");
      if (!token) {
        return null;
      }
      return { id: doc.id, expoPushToken: token };
    })
    .filter((row): row is { id: string; expoPushToken: string } => Boolean(row));
}

export async function disablePushTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) {
    return;
  }
  const db = getFirestore();
  const unique = [...new Set(tokens)];
  for (const token of unique) {
    const snap = await db
      .collection(GUARD_PUSH_TOKENS_COLLECTION)
      .where("expoPushToken", "==", token)
      .get();
    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.set(doc.ref, { disabled: true, updatedAt: Timestamp.now() }, { merge: true });
    });
    await batch.commit();
  }
}
