/**
 * RFC 4180 CSV with protection against spreadsheet formula injection
 * (cells starting with = + - @ are prefixed with an apostrophe).
 */
export function toCsv(header: string[], rows: string[][]): string {
  return `${[header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n")}\r\n`;
}

function escapeCell(value: string): string {
  // Phone numbers like +1305... are data, not formulas; keep them as-is.
  const safe = /^[=+\-@\t\r]/.test(value) && !/^\+\d+$/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
