"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login, type LoginState } from "@/lib/auth/actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="mt-2 w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Giriş yapılıyor..." : "Giriş yap"}
    </button>
  );
}

export function AdminLoginForm() {
  const [state, action] = useFormState(login, initialState);
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-bold" htmlFor="email">
        E-posta
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
          id="email"
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block text-sm font-bold" htmlFor="password">
        Şifre
        <input
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-normal outline-none ring-brand focus:ring-2"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      {state.error ? (
        <p aria-live="polite" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
