import type { Messages } from "@/lib/messages";

/** Placeholder for legal pages until counsel approves the drafts in docs/legal/. */
export function LegalPending({ title, t }: { title: string; t: Messages }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4">{t.legalPending.body}</p>
    </div>
  );
}
