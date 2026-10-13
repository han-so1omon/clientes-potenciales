"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: false });
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p role="alert" className="font-semibold text-red-700">
          Incorrect password.
        </p>
      )}
      <label className="block font-semibold">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded border-2 border-gray-400 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brand px-4 py-2 font-semibold text-white"
      >
        Sign in
      </button>
    </form>
  );
}
