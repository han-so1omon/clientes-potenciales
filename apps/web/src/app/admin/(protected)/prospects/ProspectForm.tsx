"use client";

import { LINES, PROSPECT_TYPE_LABELS, PROSPECT_TYPES } from "@cp/core";
import { useActionState } from "react";
import { lineTitle } from "@/lib/lineLabels";
import type { FormState } from "./actions";

export interface ProspectFormValues {
  id?: string;
  name?: string;
  company?: string | null;
  type?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  licensedStates?: string[];
  lines?: string[];
  languages?: string[];
  npn?: string | null;
  source?: string | null;
  notes?: string | null;
}

interface Props {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: ProspectFormValues;
  submitLabel: string;
}

const input = "mt-1 block w-full rounded border-2 border-gray-300 px-2 py-1";

export function ProspectForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  // After a failed submit, show what was typed; otherwise the saved values.
  const v = state.values;
  const text = (name: keyof ProspectFormValues & string, fallback?: string | null) =>
    v ? (v[name] ?? "") : (fallback ?? "");
  const checkedLines = initial.lines ?? [];
  const checkedLanguages = initial.languages ?? [];

  const field = (name: keyof ProspectFormValues & string, label: string, extra: object = {}) => (
    <label className="block">
      <span className="font-semibold">{label}</span>
      <input
        name={name}
        defaultValue={text(name, initial[name] as string | null | undefined)}
        className={input}
        {...extra}
      />
    </label>
  );

  return (
    <form action={formAction} className="space-y-4">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {state.status === "error" && (
        <div role="alert" className="rounded bg-red-50 p-3 text-red-800">
          {state.messages?.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}
      {state.status === "saved" && <p className="text-green-700">Saved.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {field("name", "Name *", { required: true })}
        {field("company", "Company")}
        <label className="block">
          <span className="font-semibold">Type</span>
          <select
            name="type"
            defaultValue={text("type", initial.type ?? "agent")}
            className={input}
          >
            {PROSPECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROSPECT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        {field("npn", "NPN (National Producer Number)")}
        {field("email", "Email", { type: "email" })}
        {field("phone", "Phone", { type: "tel" })}
        {field("website", "Website")}
        {field("source", "Where you found them")}
        {field("city", "City")}
        {field("state", "Home state (e.g. FL)", { maxLength: 2 })}
      </div>
      {field("licensedStates", "Licensed in states (e.g. FL, GA, TN)", {
        defaultValue: text("licensedStates", (initial.licensedStates ?? []).join(", ")),
      })}
      <fieldset>
        <legend className="font-semibold">Sells these products</legend>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
          {LINES.map((line) => (
            <label key={line} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="lines"
                value={line}
                defaultChecked={checkedLines.includes(line)}
              />
              {lineTitle(line)}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="font-semibold">Serves customers in</legend>
        <div className="mt-1 flex gap-5">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="languages"
              value="en"
              defaultChecked={checkedLanguages.includes("en")}
            />
            English
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="languages"
              value="es"
              defaultChecked={checkedLanguages.includes("es")}
            />
            Spanish
          </label>
        </div>
      </fieldset>
      <label className="block">
        <span className="font-semibold">Notes (private)</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={text("notes", initial.notes)}
          className={input}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brand px-4 py-2 font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
