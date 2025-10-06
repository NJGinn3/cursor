import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient, Role, PairingStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ pairings: [] });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ pairings: [] });

  const pairings = await prisma.pairing.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: { userA: true, userB: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ pairings });
}

export async function POST(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const targetUserId: string = body.userId;
  const myRole: Role = body.role;
  const theirRole: Role = body.theirRole;

  const pairing = await prisma.pairing.create({
    data: {
      userAId: me.id,
      roleA: myRole,
      userBId: targetUserId,
      roleB: theirRole,
      status: "PENDING",
    },
  });
  return NextResponse.json({ pairing });
}

export async function PUT(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const pairingId: string = body.pairingId;
  const action: "ACCEPT" | "REJECT" = body.action;

  const pairing = await prisma.pairing.findUnique({ where: { id: pairingId } });
  if (!pairing) return NextResponse.json({ ok: false }, { status: 404 });
  if (pairing.userBId !== me.id && pairing.userAId !== me.id)
    return NextResponse.json({ ok: false }, { status: 403 });

  const status: PairingStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
  await prisma.pairing.update({ where: { id: pairingId }, data: { status } });

  return NextResponse.json({ ok: true });
}
