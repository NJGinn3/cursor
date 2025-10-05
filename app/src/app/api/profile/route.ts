import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ profile: null });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ profile: null });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const displayName: string = body.displayName;
  const bio: string | undefined = body.bio;
  const role: Role = (body.role as Role) ?? "SWITCH";

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, displayName: displayName || user.username, bio, role },
    update: { displayName: displayName || user.username, bio, role },
  });

  return NextResponse.json({ ok: true });
}
