import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ habits: [] });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ habits: [] });

  const habits = await prisma.habit.findMany({ where: { userId: me.id, archived: false }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ habits });
}

export async function POST(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const title: string = body.title;
  const pointsOnDone: number = Math.max(0, Number(body.pointsOnDone) || 10);

  await prisma.habit.create({ data: { userId: me.id, title, pointsOnDone, cadence: "daily" } });
  return NextResponse.json({ ok: true });
}
