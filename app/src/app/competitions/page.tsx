"use client";

import useSWR from "swr";
import { useState } from "react";

type Participant = { userId: string; score: number; user: { username: string } };
type Competition = { id: string; title: string; startsAt: string; endsAt: string; participants: Participant[] };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CompetitionsPage() {
  const { data, mutate } = useSWR<{ competitions: Competition[] }>("/api/competitions", fetcher);
  const [title, setTitle] = useState("");

  async function createCompetition() {
    await fetch("/api/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    mutate();
  }

  async function join(id: string) {
    await fetch(`/api/competitions/${id}/join`, { method: "POST" });
    mutate();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Competitions</h1>
      <div className="card p-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full rounded-md border px-3 py-2 bg-[--color-card]" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <button onClick={createCompetition} className="cta px-3 py-2 rounded-md">Create</button>
      </div>

      <div className="space-y-4">
        {data?.competitions?.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs opacity-70">{new Date(c.startsAt).toLocaleString()} → {new Date(c.endsAt).toLocaleString()}</div>
              </div>
              <button onClick={() => join(c.id)} className="px-3 py-1 rounded-md bg-[--color-muted]">Join</button>
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold mb-1">Leaderboard</div>
              <div className="space-y-1">
                {c.participants.map((p) => (
                  <div key={p.userId} className="text-sm flex justify-between">
                    <span>@{p.user.username}</span>
                    <span>{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
