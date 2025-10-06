"use client";

import useSWR from "swr";
import { useState } from "react";

type Punishment = { id: string; title: string; severity: number };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PunishmentsPage() {
  const { data, mutate } = useSWR<{ punishments: Punishment[] }>("/api/punishments", fetcher);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState(1);

  async function add() {
    await fetch("/api/punishments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, severity }) });
    setTitle("");
    setSeverity(1);
    mutate();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Punishments</h1>
      <div className="card p-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full rounded-md border px-3 py-2 bg-[--color-card]" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Severity</label>
          <input type="number" min={1} max={5} className="w-24 rounded-md border px-3 py-2 bg-[--color-card]" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
        </div>
        <button onClick={add} className="cta px-3 py-2 rounded-md">Add</button>
      </div>

      <div className="space-y-2">
        {data?.punishments?.map((p) => (
          <div key={p.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs opacity-70">Severity {p.severity}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
