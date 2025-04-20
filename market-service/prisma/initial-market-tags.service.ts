import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InitialMarketTagsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const systemTags = [
      { name: 'Fresh Produce', isSystem: true },
      { name: 'Organic', isSystem: true },
      { name: 'Farmers Market', isSystem: true },
      { name: 'Artisanal', isSystem: true },
      { name: 'Local', isSystem: true },
      { name: 'International', isSystem: true },
      { name: '24/7', isSystem: true },
      { name: 'Night Market', isSystem: true },
      { name: 'Flea Market', isSystem: true },
      { name: 'Premium', isSystem: true },
    ];

    try {
      await Promise.all(
        systemTags.map(tag =>
          this.prisma.marketTag.upsert({
            where: { name: tag.name },
            update: {},
            create: tag,
          })
        )
      );
      console.log('Initial market tags check completed');
    } catch (error) {
      console.error('Error creating initial market tags:', error);
    }
  }
}