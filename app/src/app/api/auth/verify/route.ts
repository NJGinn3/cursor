import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ ok: false }, { status: 400 });

  const vt = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!vt || vt.expiresAt < new Date()) {
    return NextResponse.json({ ok: false, message: "Invalid or expired token" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: vt.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.delete({ where: { id: vt.id } }),
  ]);

  return NextResponse.redirect(new URL("/signin", req.url));
}
