import { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function getIO(server?: HTTPServer) {
  if (io) return io;
  if (!server) throw new Error("Socket.IO server not initialized");
  io = new IOServer(server, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL || "*" },
  });
  return io;
}

export function getIOIfReady() {
  return io;
}
