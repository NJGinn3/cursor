import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const competitions = await prisma.competition.findMany({
    orderBy: { startsAt: "desc" },
    include: { participants: { include: { user: true }, orderBy: { score: "desc" } } },
  });
  return NextResponse.json({ competitions });
}

export async function POST(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json();
  const title: string = body.title;
  const now = new Date();
  const ends = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const comp = await prisma.competition.create({ data: { title, startsAt: now, endsAt: ends } });
  return NextResponse.json({ competition: comp });
}
