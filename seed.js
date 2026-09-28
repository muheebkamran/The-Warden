const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const user = await prisma.user.findFirst();
  if (user) {
    const count = await prisma.commitment.count();
    if (count === 0) {
      await prisma.commitment.createMany({
        data: [
          { userId: user.id, title: 'Read', type: 'duration', targetValue: 30, unit: 'min', frequency: 'daily' },
          { userId: user.id, title: 'Watch a lecture', type: 'binary', targetValue: 1, unit: 'check', frequency: 'daily' },
          { userId: user.id, title: 'Be in the office', type: 'binary', targetValue: 1, unit: 'check', frequency: 'daily' },
          { userId: user.id, title: 'Physical activity', type: 'binary', targetValue: 1, unit: 'check', frequency: 'daily' }
        ]
      });
      console.log('Defaults seeded.');
    } else {
      console.log('Commitments already exist.');
    }
  }
}

seed().catch(console.error).finally(() => prisma.$disconnect());
