import Link from "next/link";
import { createProspectAction } from "../actions";
import { ProspectForm } from "../ProspectForm";

export default function NewProspectPage() {
  return (
    <div className="space-y-4">
      <Link href="/admin/prospects" className="text-brand underline">
        ← Buyer finder
      </Link>
      <h1 className="text-2xl font-bold">Add a prospect</h1>
      <div className="rounded bg-white p-4 shadow-sm">
        <ProspectForm action={createProspectAction} submitLabel="Add prospect" />
      </div>
    </div>
  );
}
