"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function SignInPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      emailOrUsername,
      password,
    });
    if (res?.error) setError(res.error);
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-4 card p-6">
        <div>
          <label className="block text-sm mb-1">Email or Username</label>
          <input
            className="w-full rounded-md border px-3 py-2 bg-[--color-card] text-[--color-card-foreground] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 bg-[--color-card] text-[--color-card-foreground] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="cta px-4 py-2 rounded-md font-medium">
          Sign in
        </button>
      </form>
    </div>
  );
}
