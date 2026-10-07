import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

import type { AuthenticatedGuardContext } from "./attendance";
import {
  findGuardByIdentifier,
  getDemoGuardContext,
  getGuardContextById,
} from "./guardAuth";
import { generateOtp, hashOtp, otpsMatch } from "./otp";
import { isValidIndianMobile, normalizePhone } from "./phone";

export const GUARD_LOGIN_OTP_COLLECTION = "guardLoginOtps";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

export type RequestGuardOtpResult = {
  phone: string;
  expiresInSeconds: number;
  maskedPhone: string;
  debugOtp?: string;
};

export type VerifyGuardOtpResult = {
  guard: AuthenticatedGuardContext;
};

function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length < 4) {
    return "****";
  }
  return `${normalized.slice(0, 2)}******${normalized.slice(-2)}`;
}

function isOtpDebug(): boolean {
  return (
    process.env.GUARD_OTP_DEBUG === "true" ||
    process.env.ATTENDANCE_DEMO_MODE !== "false"
  );
}

/**
 * Forgot-password / OTP login: send a 6-digit code for a registered mobile.
 * In demo mode, the demo phone always works even without a Firestore guard.
 */
export async function requestGuardLoginOtp(params: {
  phone: string;
  demoMode?: boolean;
}): Promise<RequestGuardOtpResult> {
  const demoMode = params.demoMode !== false;
  const phone = normalizePhone(params.phone);

  if (!isValidIndianMobile(phone)) {
    throw new Error("Enter a valid 10-digit mobile number.");
  }

  const demo = getDemoGuardContext();
  let guardId: string | null = null;

  const guard = await findGuardByIdentifier(phone);
  if (guard) {
    guardId = guard.id;
  } else if (demoMode && phone === normalizePhone(demo.phone)) {
    guardId = demo.guardId;
  } else {
    throw new Error("No guard account found for this mobile number.");
  }

  const otp = generateOtp(6);
  const expiresAt = Timestamp.fromMillis(Date.now() + OTP_TTL_MS);

  await getFirestore()
    .collection(GUARD_LOGIN_OTP_COLLECTION)
    .doc(phone)
    .set({
      phone,
      guardId,
      otpHash: hashOtp(otp),
      attempts: 0,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
    });

  // SMS provider seam — log / return debug OTP until SMS is wired
  console.info(`[Guard OTP] phone=${phone} otp=${otp} guardId=${guardId}`);

  return {
    phone,
    maskedPhone: maskPhone(phone),
    expiresInSeconds: OTP_TTL_MS / 1000,
    ...(isOtpDebug() ? { debugOtp: otp } : {}),
  };
}

export async function verifyGuardLoginOtp(params: {
  phone: string;
  otp: string;
  demoMode?: boolean;
}): Promise<VerifyGuardOtpResult> {
  const demoMode = params.demoMode !== false;
  const phone = normalizePhone(params.phone);
  const otp = String(params.otp ?? "").trim();

  if (!isValidIndianMobile(phone)) {
    throw new Error("Enter a valid 10-digit mobile number.");
  }
  if (!/^\d{6}$/.test(otp)) {
    throw new Error("Enter the 6-digit OTP.");
  }

  const otpRef = getFirestore().collection(GUARD_LOGIN_OTP_COLLECTION).doc(phone);
  const otpSnap = await otpRef.get();

  if (!otpSnap.exists) {
    throw new Error("No OTP requested for this mobile number.");
  }

  const challenge = otpSnap.data() as {
    otpHash: string;
    guardId: string;
    attempts: number;
    expiresAt: Timestamp;
  };

  if ((challenge.attempts ?? 0) >= OTP_MAX_ATTEMPTS) {
    await otpRef.delete();
    throw new Error("Too many invalid OTP attempts. Request a new code.");
  }

  if (challenge.expiresAt.toMillis() < Date.now()) {
    await otpRef.delete();
    throw new Error("OTP expired. Request a new one.");
  }

  if (!otpsMatch(otp, challenge.otpHash)) {
    await otpRef.update({ attempts: FieldValue.increment(1) });
    throw new Error("Invalid OTP.");
  }

  await otpRef.delete();

  if (challenge.guardId === "demo-guard-rks-8842" && demoMode) {
    return { guard: getDemoGuardContext() };
  }

  const guard = await getGuardContextById(challenge.guardId);
  if (!guard) {
    if (demoMode && phone === normalizePhone(getDemoGuardContext().phone)) {
      return { guard: getDemoGuardContext() };
    }
    throw new Error("Guard account no longer available.");
  }

  return { guard };
}
