import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await context.params;
  const reward = await prisma.reward.findUnique({ where: { id } });
  if (!reward || reward.userId !== me.id) return NextResponse.json({ ok: false }, { status: 404 });

  await prisma.pointsEvent.create({ data: { userId: me.id, delta: -reward.costPoints, reason: `Redeemed reward: ${reward.title}` } });

  return NextResponse.json({ ok: true });
}
