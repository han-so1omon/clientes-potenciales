"use client";

import { useActionState } from "react";
import { type SaveState, saveLineSettings } from "./actions";

interface Props {
  line: string;
  enabled: boolean;
  minAge: number;
  maxAge: number;
}

const numberInput = "w-16 rounded border-2 border-gray-300 px-2 py-1";

export function LineSettingsForm({ line, enabled, minAge, maxAge }: Props) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveLineSettings, {
    status: "idle",
  });
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="line" value={line} />
      <label className="flex items-center gap-2 font-semibold">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-5 w-5" />
        Offered
      </label>
      <label className="flex items-center gap-1">
        Ages
        <input
          name="minAge"
          type="number"
          defaultValue={minAge}
          className={numberInput}
          aria-label="Minimum age"
        />
        to
        <input
          name="maxAge"
          type="number"
          defaultValue={maxAge}
          className={numberInput}
          aria-label="Maximum age"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brand px-3 py-1 font-semibold text-white"
      >
        Save
      </button>
      {state.status === "saved" && <span className="text-green-700">Saved</span>}
      {state.status === "error" && <span className="text-red-700">{state.message}</span>}
    </form>
  );
}
