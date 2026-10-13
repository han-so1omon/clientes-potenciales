import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "./env";

/**
 * Phase 0 admin auth: one owner password, signed session cookie.
 * Replace with per-user accounts when buyers/staff get logins (Phase 1, M3).
 */
const COOKIE = "admin_session";
const SESSION_MS = 12 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", serverEnv().ADMIN_SESSION_SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passwordMatches(candidate: string): boolean {
  // Compare HMACs so lengths always match and timing does not leak the password.
  return safeEqual(sign(`pw:${candidate}`), sign(`pw:${serverEnv().ADMIN_PASSWORD}`));
}

export async function startAdminSession(now = Date.now()): Promise<void> {
  const expires = String(now + SESSION_MS);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_MS / 1000,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function isAdmin(now = Date.now()): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !safeEqual(signature, sign(expires))) return false;
  return Number(expires) > now;
}

/** Call at the top of every admin page, action, and route handler. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
