"use client";

import { useActionState } from "react";
import { type ImportState, importProspectsAction } from "../actions";

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importProspectsAction, {
    status: "idle",
  });
  return (
    <div className="space-y-4">
      <form action={action} className="flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept=".csv,text/csv" required aria-label="CSV file" />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-brand px-4 py-2 font-semibold text-white"
        >
          {pending ? "Importing…" : "Import"}
        </button>
      </form>
      {state.status !== "idle" && (
        <div role="status" className="space-y-2 rounded bg-white p-4 shadow-sm">
          {state.message && <p className="font-semibold text-red-700">{state.message}</p>}
          {state.status === "done" && (
            <p className="font-semibold text-green-800">
              Imported {state.created} prospect{state.created === 1 ? "" : "s"}.
            </p>
          )}
          {state.duplicates && state.duplicates.length > 0 && (
            <p>
              Skipped {state.duplicates.length} already in the list (same email or NPN):{" "}
              {state.duplicates.map((d) => `row ${d.row} (${d.name})`).join(", ")}
            </p>
          )}
          {state.errors && state.errors.length > 0 && (
            <div>
              <p className="font-semibold">Rows with problems (not imported):</p>
              <ul className="list-disc pl-6">
                {state.errors.map((e) => (
                  <li key={e.row}>
                    Row {e.row}: {e.messages.join("; ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {state.unknownColumns && state.unknownColumns.length > 0 && (
            <p className="text-gray-600">Ignored columns: {state.unknownColumns.join(", ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
