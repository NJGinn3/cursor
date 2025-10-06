import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient, KinkRatingValue } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSessionOnServer();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  const kinks = await prisma.kink.findMany({ orderBy: { name: "asc" } });
  const ratings = user
    ? await prisma.kinkRating.findMany({ where: { userId: user.id } })
    : [];

  const ratingByKinkId = new Map(ratings.map((r) => [r.kinkId, r]));

  return NextResponse.json({
    kinks: kinks.map((k) => ({
      ...k,
      userRating: user ? ratingByKinkId.get(k.id) ?? null : null,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const kinkId: string = body.kinkId;
  const value: KinkRatingValue = body.value;

  if (!kinkId || !["GO", "MAYBE", "NOGO"].includes(value)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await prisma.kinkRating.upsert({
    where: { userId_kinkId: { userId: user.id, kinkId } },
    create: { userId: user.id, kinkId, value, intensity: value === "GO" ? 80 : value === "MAYBE" ? 50 : 10 },
    update: { value },
  });

  return NextResponse.json({ ok: true });
}
