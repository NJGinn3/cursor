import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await context.params;
  await prisma.competitionParticipant.upsert({
    where: { competitionId_userId: { competitionId: id, userId: user.id } },
    create: { competitionId: id, userId: user.id, score: 0 },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
