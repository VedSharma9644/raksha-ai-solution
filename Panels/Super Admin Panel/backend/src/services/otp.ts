import { createHash, randomInt } from "node:crypto";

export function generateOtp(length = 6): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, "0");
}

export function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export function otpsMatch(otp: string, hash: string): boolean {
  return hashOtp(otp) === hash;
}
