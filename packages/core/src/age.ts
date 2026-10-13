export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

/** True if the parts form a real calendar date (e.g. rejects Feb 30). */
export function isValidDate({ year, month, day }: DateParts): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Whole years of age on `now` (UTC calendar date) for someone born on `dob`. */
export function ageOn(dob: DateParts, now: Date): number {
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth() + 1;
  const nowDay = now.getUTCDate();
  let age = nowYear - dob.year;
  if (nowMonth < dob.month || (nowMonth === dob.month && nowDay < dob.day)) age -= 1;
  return age;
}

/** ISO date string YYYY-MM-DD for storage. */
export function toIsoDate({ year, month, day }: DateParts): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
