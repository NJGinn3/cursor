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
