import { PROSPECT_CSV_COLUMNS, PROSPECT_TYPES } from "@cp/core";
import Link from "next/link";
import { ImportForm } from "./ImportForm";

export default function ImportProspectsPage() {
  return (
    <div className="space-y-4">
      <Link href="/admin/prospects" className="text-brand underline">
        ← Buyer finder
      </Link>
      <h1 className="text-2xl font-bold">Import prospects from CSV</h1>
      <div className="space-y-2 rounded bg-white p-4 text-sm shadow-sm">
        <p>
          Use a spreadsheet saved as CSV. Only <strong>name</strong> is required. Columns:{" "}
          <code>{PROSPECT_CSV_COLUMNS.join(", ")}</code>.{" "}
          <a className="text-brand underline" href="/admin/prospects/import/template">
            Download a template
          </a>
          .
        </p>
        <p>
          <code>type</code> is one of {PROSPECT_TYPES.join(", ")}. Separate several{" "}
          <code>licensed_states</code>, <code>lines</code>, or <code>languages</code> (en, es) with
          semicolons, e.g. <code>FL;GA</code>. Rows whose email or NPN is already in the list are
          skipped.
        </p>
        <p>
          Respect the terms of use of wherever a list comes from (for example, state insurance
          department licensee data).
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
