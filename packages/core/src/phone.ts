/**
 * Normalizes a US phone number to E.164 (+1XXXXXXXXXX), or returns undefined if invalid.
 * Applies basic North American Numbering Plan rules; it does not check that the line is live.
 */
export function normalizeUsPhone(input: string): string | undefined {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return undefined;

  const areaCode = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  // Area codes and exchanges cannot start with 0 or 1.
  if (/^[01]/.test(areaCode) || /^[01]/.test(exchange)) return undefined;
  // N11 codes (211, 411, 911...) are service codes, not area codes.
  if (areaCode[1] === "1" && areaCode[2] === "1") return undefined;
  // 555-01XX numbers are reserved for fiction.
  if (exchange === "555" && digits.slice(6, 8) === "01") return undefined;

  return `+1${digits}`;
}

/** Masks a phone for display in logs or lists: +1******4567 */
export function maskPhone(e164: string): string {
  return `${e164.slice(0, 2)}******${e164.slice(-4)}`;
}
