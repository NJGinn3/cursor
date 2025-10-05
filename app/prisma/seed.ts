import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KINKS: Array<{ name: string; category: string; description?: string }> = [
  { name: 'Bondage', category: 'Restraints' },
  { name: 'Discipline', category: 'Power Exchange' },
  { name: 'Dominance', category: 'Power Exchange' },
  { name: 'Submission', category: 'Power Exchange' },
  { name: 'Sadism', category: 'Sensation' },
  { name: 'Masochism', category: 'Sensation' },
  { name: 'Roleplay', category: 'Scenarios' },
  { name: 'Impact Play', category: 'Sensation' },
  { name: 'Sensory Deprivation', category: 'Sensation' },
  { name: 'Aftercare', category: 'Care' },
];

async function main() {
  for (const kink of KINKS) {
    await prisma.kink.upsert({
      where: { name: kink.name },
      create: kink,
      update: {},
    });
  }

  const levelData = [
    { level: 1, minPoints: 0, title: 'Novice' },
    { level: 2, minPoints: 100, title: 'Initiate' },
    { level: 3, minPoints: 250, title: 'Adept' },
    { level: 4, minPoints: 500, title: 'Expert' },
    { level: 5, minPoints: 1000, title: 'Mastermind' },
  ];

  for (const lvl of levelData) {
    await prisma.level.upsert({
      where: { level: lvl.level },
      create: lvl,
      update: { minPoints: lvl.minPoints, title: lvl.title },
    });
  }

  // Demo users
  const demoUsers = [
    { email: 'dom@example.com', username: 'dom', password: 'password123', role: 'DOM' as const },
    { email: 'sub@example.com', username: 'sub', password: 'password123', role: 'SUB' as const },
  ];

  for (const du of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { email: du.email } });
    if (!existing) {
      const hashedPassword = await (await import('bcryptjs')).default.hash(du.password, 10);
      const user = await prisma.user.create({ data: { email: du.email, username: du.username, hashedPassword } });
      await prisma.profile.create({ data: { userId: user.id, displayName: du.username, role: du.role } });

      // Give some sample ratings
      const kinks = await prisma.kink.findMany();
      for (const [i, k] of kinks.entries()) {
        const value = du.role === 'DOM' ? (i % 3 === 0 ? 'GO' : i % 3 === 1 ? 'MAYBE' : 'NOGO') : (i % 3 === 0 ? 'MAYBE' : i % 3 === 1 ? 'GO' : 'NOGO');
        await prisma.kinkRating.upsert({
          where: { userId_kinkId: { userId: user.id, kinkId: k.id } },
          create: { userId: user.id, kinkId: k.id, value: value as any, intensity: value === 'GO' ? 80 : value === 'MAYBE' ? 50 : 10 },
          update: { value: value as any },
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
