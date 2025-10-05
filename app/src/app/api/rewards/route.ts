import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ rewards: [] });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ rewards: [] });

  const rewards = await prisma.reward.findMany({ where: { userId: me.id } });
  return NextResponse.json({ rewards });
}

export async function POST(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const title: string = body.title;
  const costPoints: number = Math.max(0, Number(body.costPoints) || 100);

  await prisma.reward.create({ data: { userId: me.id, title, costPoints } });
  return NextResponse.json({ ok: true });
}
