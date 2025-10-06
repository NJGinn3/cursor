"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message = {
  id: string;
  senderId: string;
  pairingId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ChatPage() {
  const [pairingId, setPairingId] = useState<string>("");
  const { data, mutate } = useSWR<{ messages: Message[] }>(
    () => (pairingId ? `/api/chat?pairingId=${pairingId}` : null),
    fetcher,
    { refreshInterval: 3000 }
  );
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(undefined as unknown as string, { path: "/socket.io" });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !pairingId) return;
    socket.emit("join", pairingId);
    const onNewMessage = () => mutate();
    socket.on("message:new", onNewMessage);
    return () => {
      socket.off("message:new", onNewMessage);
    };
  }, [socket, pairingId, mutate]);

  async function send() {
    if (!pairingId || !content) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pairingId, content }),
    });
    setContent("");
    mutate();
    socket?.emit("message:new", { pairingId });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <input
        placeholder="Enter pairing ID"
        className="w-full rounded-md border px-3 py-2 bg-[--color-card]"
        value={pairingId}
        onChange={(e) => setPairingId(e.target.value)}
      />
      <div className="card p-4 h-80 overflow-y-auto">
        {data?.messages?.map((m) => (
          <div key={m.id} className="text-sm mb-2">
            <span className="opacity-70">{m.senderId.slice(0, 6)}:</span> {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 bg-[--color-card]"
          placeholder="Type a message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={send} className="cta px-3 py-2 rounded-md">Send</button>
      </div>
    </div>
  );
}
