import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ punishments: [] });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ punishments: [] });

  const punishments = await prisma.punishment.findMany({ where: { userId: me.id } });
  return NextResponse.json({ punishments });
}

export async function POST(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const title: string = body.title;
  const severity: number = Math.max(1, Math.min(5, Number(body.severity) || 1));

  await prisma.punishment.create({ data: { userId: me.id, title, severity } });
  return NextResponse.json({ ok: true });
}
