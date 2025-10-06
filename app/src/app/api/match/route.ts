import { getSessionOnServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function scoreMatch(a: { go: Set<string>; maybe: Set<string>; nogo: Set<string>; role: string }, b: { go: Set<string>; maybe: Set<string>; nogo: Set<string>; role: string }) {
  // Basic compatibility: complementary roles preferred (DOM vs SUB). SWITCH is neutral.
  let roleScore = 0;
  if ((a.role === "DOM" && b.role === "SUB") || (a.role === "SUB" && b.role === "DOM")) roleScore = 20;
  else if (a.role === "SWITCH" || b.role === "SWITCH") roleScore = 10;

  // Kink alignment: penalize hard conflicts, reward GO overlap, mild for MAYBE
  let kinkScore = 0;
  for (const k of a.go) {
    if (b.nogo.has(k)) kinkScore -= 50; // hard boundary violation
    else if (b.go.has(k)) kinkScore += 5;
    else if (b.maybe.has(k)) kinkScore += 2;
  }
  for (const k of a.maybe) {
    if (b.go.has(k)) kinkScore += 2;
  }
  // Symmetry not strictly necessary due to double counting above but acceptable.

  return roleScore + kinkScore;
}

export async function GET() {
  const session = await getSessionOnServer();
  if (!session?.user?.email) return NextResponse.json({ matches: [] });

  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ matches: [] });

  const myProfile = await prisma.profile.findUnique({ where: { userId: me.id } });
  const myRatings = await prisma.kinkRating.findMany({ where: { userId: me.id }, include: { kink: true } });

  const users = await prisma.user.findMany({ where: { id: { not: me.id } }, include: { profile: true } });

  const meSet = {
    go: new Set(myRatings.filter((r) => r.value === "GO").map((r) => r.kink.name)),
    maybe: new Set(myRatings.filter((r) => r.value === "MAYBE").map((r) => r.kink.name)),
    nogo: new Set(myRatings.filter((r) => r.value === "NOGO").map((r) => r.kink.name)),
    role: myProfile?.role ?? "SWITCH",
  };

  const candidateRatings = await prisma.kinkRating.findMany({ where: { userId: { in: users.map((u) => u.id) } }, include: { kink: true } });
  const ratingsByUser = new Map<string, typeof candidateRatings>();
  for (const r of candidateRatings) {
    const arr = ratingsByUser.get(r.userId) ?? [];
    arr.push(r);
    ratingsByUser.set(r.userId, arr);
  }

  const results = users.map((u) => {
    const prof = u.profile;
    const rs = ratingsByUser.get(u.id) ?? [];
    const set = {
      go: new Set(rs.filter((r) => r.value === "GO").map((r) => r.kink.name)),
      maybe: new Set(rs.filter((r) => r.value === "MAYBE").map((r) => r.kink.name)),
      nogo: new Set(rs.filter((r) => r.value === "NOGO").map((r) => r.kink.name)),
      role: prof?.role ?? "SWITCH",
    };
    const score = scoreMatch(meSet, set) + scoreMatch(set, meSet);
    return { userId: u.id, username: u.username, displayName: prof?.displayName ?? u.username, role: set.role, score };
  });

  results.sort((a, b) => b.score - a.score);

  return NextResponse.json({ matches: results.slice(0, 20) });
}
