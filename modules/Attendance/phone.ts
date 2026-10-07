/** Normalize Indian mobile numbers to a 10-digit form when possible. */
export function normalizePhone(raw: string): string {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isValidIndianMobile(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(raw));
}

/** Variants commonly stored by HR / Admin forms. */
export function phoneLookupVariants(raw: string): string[] {
  const normalized = normalizePhone(raw);
  const trimmed = String(raw ?? "").trim();
  const variants = [
    trimmed,
    normalized,
    `0${normalized}`,
    `+91${normalized}`,
    `91${normalized}`,
  ];
  return [...new Set(variants.filter(Boolean))];
}
