import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InitialAdminService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@1234';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    try {
      await this.prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          profile: {
            create: {
              firstName: 'System',
              lastName: 'Admin',
              birthDate: new Date('1990-01-01'),
            }
          }
        }
      });
      console.log('Initial admin check completed');
    } catch (error) {
      console.error('Error creating initial admin:', error);
    }
  }
}