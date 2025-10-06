import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import { createTransport } from "@/lib/mailer";

const prisma = new PrismaClient();

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
  role: z.enum(["DOM", "SUB", "SWITCH"]).default("SWITCH"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }
  const { email, username, password, role } = parsed.data;

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    return NextResponse.json({ message: "Email or username already in use" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, username, hashedPassword } });

  await prisma.profile.create({
    data: {
      userId: user.id,
      displayName: username,
      role: role as Role,
    },
  });

  // Create verification token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await prisma.emailVerificationToken.create({ data: { userId: user.id, token, expiresAt } });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;
  const transporter = createTransport();
  await transporter.sendMail({
    to: email,
    from: process.env.MAIL_FROM || "no-reply@example.com",
    subject: "Verify your email",
    text: `Welcome ${username}! Verify your email: ${verifyUrl}`,
    html: `<p>Welcome <b>${username}</b>! Click to verify: <a href="${verifyUrl}">Verify Email</a></p>`,
  });

  return NextResponse.json({ ok: true });
}
