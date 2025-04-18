import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Allow overriding tags through environment variable
const marketTags = process.env.MARKET_TAGS ? 
  JSON.parse(process.env.MARKET_TAGS) : [
    'Food Market',
    'Clothing Market',
    'Night Market',
    'Walking Street',
    'Electronics Market',
    'Weekend Market',
    'Flea Market',
    'Farmers Market',
    'Arts & Crafts',
    'Antiques Market',
    'Souvenir Market',
    'Street Food',
    'Fresh Produce',
    'Local Goods',
    'Mixed Retail'
  ];

async function seedMarketTags() {
  console.log('Start seeding market tags...');
  
  try {
    for (const tagName of marketTags) {
      await prisma.marketTag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          isSystem: true,
        },
      });
    }
    console.log('Market tags seeding completed.');
  } catch (error) {
    console.error('Error seeding market tags:', error);
    throw error;
  }
}

if (require.main === module) {
  seedMarketTags()
    .catch((error) => {
      console.error('Error seeding market tags:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedMarketTags;
