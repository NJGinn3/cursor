"use client";

import useSWR from "swr";

type Pairing = { id: string; userA: { username: string }; userB: { username: string }; roleA: "DOM" | "SUB" | "SWITCH"; roleB: "DOM" | "SUB" | "SWITCH"; status: "PENDING" | "ACCEPTED" | "REJECTED" | "ENDED" };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PairingsPage() {
  const { data, mutate } = useSWR<{ pairings: Pairing[] }>("/api/pairings", fetcher);
  if (!data) return <p>Loading...</p>;

  async function accept(pairingId: string) {
    await fetch("/api/pairings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pairingId, action: "ACCEPT" }) });
    mutate();
  }
  async function reject(pairingId: string) {
    await fetch("/api/pairings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pairingId, action: "REJECT" }) });
    mutate();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Pairings</h1>
      <div className="space-y-3">
        {data.pairings.map((p) => (
          <div key={p.id} className="card p-4 flex items-center justify-between">
            <div className="text-sm">
              <div>
                {p.userA.username} ({p.roleA}) ↔ {p.userB.username} ({p.roleB})
              </div>
              <div className="opacity-70">Status: {p.status}</div>
            </div>
            <div className="flex gap-2">
              {p.status === "PENDING" && (
                <>
                  <button onClick={() => accept(p.id)} className="cta px-3 py-1 rounded-md text-sm">Accept</button>
                  <button onClick={() => reject(p.id)} className="px-3 py-1 rounded-md text-sm bg-[--color-muted]">Reject</button>
                </>
              )}
              {p.status === "ACCEPTED" && (
                <a href={`/chat?pairingId=${p.id}`} className="px-3 py-1 rounded-md text-sm bg-[--color-muted]">Start chat</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
