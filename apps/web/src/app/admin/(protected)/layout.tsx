import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/adminSession";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div>
      <header className="flex items-center justify-between bg-gray-900 px-6 py-3 text-white">
        <nav className="flex gap-6 font-semibold">
          <Link href="/admin/leads">Leads</Link>
          <Link href="/admin/markets">Markets</Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="underline">
            Sign out
          </button>
        </form>
      </header>
      <div className="mx-auto max-w-6xl p-6">{children}</div>
    </div>
  );
}
