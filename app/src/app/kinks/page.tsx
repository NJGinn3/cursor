"use client";

import useSWR from "swr";

type Kink = { id: string; name: string; category: string; userRating?: { value: "GO" | "MAYBE" | "NOGO" } | null };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function KinksPage() {
  const { data, mutate } = useSWR<{ kinks: Kink[] }>("/api/kinks", fetcher);
  if (!data) return <p>Loading...</p>;

  async function rate(kinkId: string, value: string) {
    await fetch("/api/kinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kinkId, value }),
    });
    mutate();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Kink Ratings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.kinks.map((k) => (
          <div key={k.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{k.name}</div>
                <div className="text-xs opacity-70">{k.category}</div>
              </div>
              <div className="flex gap-2">
                {(["GO", "MAYBE", "NOGO"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => rate(k.id, v)}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      k.userRating?.value === v ? "cta" : "bg-[--color-muted]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
