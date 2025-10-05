"use client";

import useSWR from "swr";

type MatchItem = { userId: string; username: string; displayName: string; role: "DOM" | "SUB" | "SWITCH"; score: number };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MatchPage() {
  const { data } = useSWR<{ matches: MatchItem[] }>("/api/match", fetcher);
  async function requestPairing(userId: string, theirRole: string) {
    const myRole = theirRole === "DOM" ? "SUB" : "DOM";
    await fetch("/api/pairings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: myRole, theirRole }),
    });
    alert("Pairing request sent");
  }
  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Suggested Matches</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.matches.map((m) => (
          <div key={m.userId} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{m.displayName}</div>
                <div className="text-xs opacity-70">@{m.username} · {m.role}</div>
              </div>
              <div className="text-sm font-mono">Score: {m.score}</div>
            </div>
              <div className="mt-4">
                <button onClick={() => requestPairing(m.userId, m.role)} className="cta px-3 py-2 rounded-md text-sm">Request Pairing</button>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
}
