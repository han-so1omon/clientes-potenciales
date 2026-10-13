"use server";

import { writeAudit } from "@cp/db";
import { redirect } from "next/navigation";
import { endAdminSession, passwordMatches, startAdminSession } from "@/lib/adminSession";
import { getDb } from "@/lib/db";

export async function login(
  _prev: { error: boolean },
  formData: FormData,
): Promise<{ error: boolean }> {
  const password = formData.get("password");
  if (typeof password !== "string" || !passwordMatches(password)) {
    // Slow down guessing. Phase 1 replaces this with real accounts and rate limiting.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { error: true };
  }
  await startAdminSession();
  await writeAudit(getDb(), { actor: "owner", action: "admin.login", entityType: "session" });
  redirect("/admin/leads");
}

export async function logout(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}
