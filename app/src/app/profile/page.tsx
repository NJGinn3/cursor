"use client";

import useSWR from "swr";
import { useState } from "react";

type Profile = { displayName: string; bio?: string; role: "DOM" | "SUB" | "SWITCH" } | null;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProfilePage() {
  const { data, mutate } = useSWR<{ profile: Profile }>("/api/profile", fetcher);
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [role, setRole] = useState<string>("SWITCH");

  if (!data) return <p>Loading...</p>;

  const profile = data.profile;

  async function save() {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, role }),
    });
    mutate();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Display Name</label>
          <input
            className="w-full rounded-md border px-3 py-2 bg-[--color-card]"
            defaultValue={profile?.displayName ?? ""}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea
            className="w-full rounded-md border px-3 py-2 bg-[--color-card]"
            defaultValue={profile?.bio ?? ""}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select
            className="w-full rounded-md border px-3 py-2 bg-[--color-card]"
            defaultValue={profile?.role ?? "SWITCH"}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="DOM">Dom</option>
            <option value="SUB">Sub</option>
            <option value="SWITCH">Switch</option>
          </select>
        </div>
        <button onClick={save} className="cta px-4 py-2 rounded-md font-medium">
          Save
        </button>
      </div>
    </div>
  );
}
