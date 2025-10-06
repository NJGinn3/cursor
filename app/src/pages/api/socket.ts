import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

export const config = {
  api: { bodyParser: false },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const httpServer = (res.socket as unknown as { server?: HTTPServer }).server;
  if (!httpServer) {
    res.status(500).end("No server");
    return;
  }
  const g = globalThis as unknown as { io?: IOServer };
  if (!g.io) {
    const io = new IOServer(httpServer as HTTPServer, {
      path: "/socket.io",
      addTrailingSlash: false,
    });
    io.on("connection", (socket) => {
      socket.on("join", (roomId: string) => {
        if (roomId) socket.join(roomId);
      });
    });
    g.io = io;
  }
  res.end();
}
