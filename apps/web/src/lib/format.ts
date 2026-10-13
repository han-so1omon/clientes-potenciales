/** Replaces {name} placeholders in a message, e.g. fill("ages {min}", { min: 50 }). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
