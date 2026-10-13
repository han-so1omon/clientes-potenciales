import { pingDb } from "@cp/db";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Health check for the host: 200 when the app can reach the database. */
export async function GET(): Promise<Response> {
  try {
    await pingDb(getDb());
    return Response.json({ ok: true });
  } catch (error) {
    console.error("health check failed", error instanceof Error ? error.message : error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
