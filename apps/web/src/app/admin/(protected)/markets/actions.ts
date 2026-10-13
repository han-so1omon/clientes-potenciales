"use server";

import { SERVICE_STATES } from "@cp/core";
import { listServiceStates, setStateEnabled, updateLineSettings } from "@cp/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminSession";
import { getDb } from "@/lib/db";

export type SaveState = { status: "idle" | "saved" | "error"; message?: string };

const lineFormSchema = z.object({
  line: z.string(),
  enabled: z.literal("on").optional(),
  minAge: z.coerce.number(),
  maxAge: z.coerce.number(),
});

export async function saveLineSettings(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const parsed = lineFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Please enter valid ages." };
  const result = await updateLineSettings(getDb(), {
    line: parsed.data.line,
    enabled: parsed.data.enabled === "on",
    minAge: parsed.data.minAge,
    maxAge: parsed.data.maxAge,
    actor: "owner",
  });
  if (result.kind === "invalid") return { status: "error", message: result.message };
  revalidatePath("/admin/markets");
  return { status: "saved" };
}

export async function saveServiceStates(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const db = getDb();
  const wanted = new Set(formData.getAll("states").map(String));
  const current = await listServiceStates(db);
  for (const row of current) {
    const enabled = wanted.has(row.state);
    if (enabled !== row.enabled && (SERVICE_STATES as readonly string[]).includes(row.state)) {
      await setStateEnabled(db, { state: row.state, enabled, actor: "owner" });
    }
  }
  revalidatePath("/admin/markets");
  return { status: "saved" };
}
