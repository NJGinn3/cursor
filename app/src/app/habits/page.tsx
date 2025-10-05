"use client";

import useSWR from "swr";
import { useState } from "react";

type Habit = { id: string; title: string; pointsOnDone: number };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HabitsPage() {
  const { data, mutate } = useSWR<{ habits: Habit[] }>("/api/habits", fetcher);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(10);

  async function add() {
    await fetch("/api/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, pointsOnDone: points }) });
    setTitle("");
    setPoints(10);
    mutate();
  }

  async function done(habitId: string) {
    await fetch(`/api/habits/${habitId}/done`, { method: "POST" });
    mutate();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Habits</h1>
      <div className="card p-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full rounded-md border px-3 py-2 bg-[--color-card]" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Points</label>
          <input type="number" className="w-24 rounded-md border px-3 py-2 bg-[--color-card]" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
        </div>
        <button onClick={add} className="cta px-3 py-2 rounded-md">Add</button>
      </div>

      <div className="space-y-2">
        {data?.habits?.map((h) => (
          <div key={h.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{h.title}</div>
              <div className="text-xs opacity-70">{h.pointsOnDone} pts</div>
            </div>
            <button onClick={() => done(h.id)} className="px-3 py-1 rounded-md bg-[--color-muted]">Mark Done</button>
          </div>
        ))}
      </div>
    </div>
  );
}
