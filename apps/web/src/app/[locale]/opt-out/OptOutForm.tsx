"use client";

import { useActionState } from "react";
import type { Messages } from "@/lib/messages";
import { type OptOutState, optOut } from "./actions";

const inputClass = "mt-1 block w-full rounded-lg border-2 border-gray-400 px-3 py-3 text-lg";

export function OptOutForm({ t }: { t: Messages }) {
  const [state, action, pending] = useActionState<OptOutState, FormData>(optOut, {
    status: "idle",
  });

  if (state.status === "done") {
    return (
      <p role="status" className="rounded-lg bg-green-50 p-4 text-xl font-semibold text-green-900">
        {t.optOut.done}
      </p>
    );
  }
  return (
    <form action={action} className="space-y-5">
      {state.status !== "idle" && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 font-semibold text-red-800">
          {state.status === "need_one" ? t.optOut.needOne : t.errors.form}
        </p>
      )}
      <label className="block font-semibold">
        {t.optOut.phone}
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className={inputClass}
        />
      </label>
      <label className="block font-semibold">
        {t.optOut.email}
        <input name="email" type="email" autoComplete="email" className={inputClass} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-6 py-4 text-xl font-bold text-white disabled:opacity-60"
      >
        {t.optOut.submit}
      </button>
    </form>
  );
}
