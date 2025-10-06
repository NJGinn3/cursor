"use client";

import useSWR from "swr";
import { useState } from "react";

type Reward = { id: string; title: string; costPoints: number };
type Points = { points: number; level: { title: string } | null };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RewardsPage() {
  const { data, mutate } = useSWR<{ rewards: Reward[] }>("/api/rewards", fetcher);
  const { data: me } = useSWR<Points>("/api/me/points", fetcher);
  const [title, setTitle] = useState("");
  const [costPoints, setCostPoints] = useState(100);

  async function add() {
    await fetch("/api/rewards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, costPoints }) });
    setTitle("");
    setCostPoints(100);
    mutate();
  }

  async function redeem(id: string) {
    await fetch(`/api/rewards/${id}/redeem`, { method: "POST" });
    mutate();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Rewards</h1>
      <div className="text-sm">Points: {me?.points ?? 0} · Level: {me?.level?.title ?? "-"}</div>
      <div className="card p-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full rounded-md border px-3 py-2 bg-[--color-card]" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Cost (pts)</label>
          <input type="number" className="w-24 rounded-md border px-3 py-2 bg-[--color-card]" value={costPoints} onChange={(e) => setCostPoints(Number(e.target.value))} />
        </div>
        <button onClick={add} className="cta px-3 py-2 rounded-md">Add</button>
      </div>

      <div className="space-y-2">
        {data?.rewards?.map((r) => (
          <div key={r.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs opacity-70">{r.costPoints} pts</div>
            </div>
            <button onClick={() => redeem(r.id)} className="px-3 py-1 rounded-md bg-[--color-muted]">Redeem</button>
          </div>
        ))}
      </div>
    </div>
  );
}
