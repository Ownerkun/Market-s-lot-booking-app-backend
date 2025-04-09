import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const systemTags = ['Food', 'Clothes', 'Mixed', 'Electronics', 'Furniture'];
  
  for (const tag of systemTags) {
    await prisma.marketTag.upsert({
      where: { name: tag },
      update: {},
      create: {
        name: tag,
        isSystem: true,
      },
    });  
  }
  console.log('Market tags seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });