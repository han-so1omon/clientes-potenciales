import { type Line, type LineSettings, lineFromSlug } from "@cp/core";
import { getLineSettings } from "@cp/db";
import { notFound } from "next/navigation";
import { getDb } from "./db";

/** Resolves the [product] route segment to an ENABLED line; otherwise 404. */
export async function resolveEnabledLine(
  params: Promise<{ product: string }>,
): Promise<{ line: Line; settings: LineSettings }> {
  const { product } = await params;
  const line = lineFromSlug(product);
  if (!line) notFound();
  const settings = await getLineSettings(getDb(), line);
  if (!settings?.enabled) notFound();
  return { line, settings };
}
