import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSessionOnServer } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ points: 0, level: null });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ points: 0, level: null });

  const events = await prisma.pointsEvent.findMany({ where: { userId: user.id } });
  const points = events.reduce((sum, e) => sum + e.delta, 0);
  const level = await prisma.level.findFirst({ where: { minPoints: { lte: points } }, orderBy: { minPoints: "desc" } });

  return NextResponse.json({ points, level });
}
