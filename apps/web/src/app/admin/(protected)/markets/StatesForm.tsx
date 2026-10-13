"use client";

import { useActionState } from "react";
import { type SaveState, saveServiceStates } from "./actions";

export function StatesForm({ states }: { states: { state: string; enabled: boolean }[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveServiceStates, {
    status: "idle",
  });
  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap gap-4">
        {states.map((s) => (
          <label key={s.state} className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              name="states"
              value={s.state}
              defaultChecked={s.enabled}
              className="h-5 w-5"
            />
            {s.state}
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brand px-3 py-1 font-semibold text-white"
      >
        Save states
      </button>
      {state.status === "saved" && <span className="ml-3 text-green-700">Saved</span>}
    </form>
  );
}
