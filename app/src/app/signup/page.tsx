"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"DOM" | "SUB" | "SWITCH">("SWITCH");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, role }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({ message: "Sign up failed" }));
      setError(j.message ?? "Sign up failed");
      return;
    }
    await signIn("credentials", { emailOrUsername: email, password, redirect: true, callbackUrl: "/" });
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create an account</h1>
      <form onSubmit={onSubmit} className="space-y-4 card p-6">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full rounded-md border px-3 py-2 bg-[--color-card]" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input className="w-full rounded-md border px-3 py-2 bg-[--color-card]" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="w-full rounded-md border px-3 py-2 bg-[--color-card]" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select
            className="w-full rounded-md border px-3 py-2 bg-[--color-card]"
            value={role}
            onChange={(e) => setRole(e.target.value as "DOM" | "SUB" | "SWITCH")}
          >
            <option value="DOM">Dom</option>
            <option value="SUB">Sub</option>
            <option value="SWITCH">Switch</option>
          </select>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="cta px-4 py-2 rounded-md font-medium" disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
