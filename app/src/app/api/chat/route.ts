import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ messages: [] });
  const url = new URL(req.url);
  const pairingId = url.searchParams.get("pairingId");
  if (!pairingId) return NextResponse.json({ messages: [] });

  // Mark messages from other user as read when fetching
  if (session.user?.email) {
    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (me) {
      await prisma.message.updateMany({ where: { pairingId, senderId: { not: me.id }, readAt: null }, data: { readAt: new Date() } });
    }
  }

  const messages = await prisma.message.findMany({
    where: { pairingId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const pairingId: string = body.pairingId;
  const content: string = body.content;

  await prisma.message.create({ data: { pairingId, content, senderId: me.id } });
  return NextResponse.json({ ok: true });
}
