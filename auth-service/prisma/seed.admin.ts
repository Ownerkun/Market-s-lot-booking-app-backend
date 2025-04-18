import { PrismaClient, Role } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('Start seeding admin user...');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@system.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  
  const hashedPassword = await bcryptjs.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator'
        }
      }
    },
  });

  console.log('Admin user seeding completed.');
}

seedAdmin()
  .catch((error) => {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
