/** Normalize to 10-digit Indian mobile when possible. */
export function normalizeLoginPhone(raw: string): string {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isValidLoginMobile(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizeLoginPhone(raw));
}

/** Guard employee codes: letters/numbers/hyphen/underscore — not a mobile number. */
export function isValidGuardEmployeeCode(raw: string): boolean {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 32) {
    return false;
  }
  if (isValidLoginMobile(trimmed)) {
    return false;
  }
  // Pure 10+ digit strings are treated as phone attempts, not IDs.
  if (/^\d{10,}$/.test(trimmed.replace(/\s/g, ''))) {
    return false;
  }
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(trimmed);
}

export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10);
}

export function sanitizeGuardIdInput(raw: string): string {
  return raw.replace(/[^A-Za-z0-9._-]/g, '').slice(0, 32);
}
