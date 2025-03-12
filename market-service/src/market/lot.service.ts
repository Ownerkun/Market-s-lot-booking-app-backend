import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLotDto, UpdateLotDto } from './dto/market.dto';
import { Role } from './enum/role.enum';

@Injectable()
export class LotService {
  constructor(private prisma: PrismaService) {}

  async createLot(marketId: string, dto: CreateLotDto, userId: string, userRole: Role) {
    if (userRole === Role.LANDLORD) {
      const market = await this.prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!market) {
        throw new NotFoundException('Market not found');
      }

      if (market.ownerId !== userId) {
        throw new ForbiddenException('You do not have permission to create a lot in this market');
      }
    }

    return this.prisma.lot.create({
      data: {
        name: dto.name,
        details: dto.details,
        price: dto.price,
        available: dto.available,
        shape: dto.shape,
        position: dto.position,
        market: { connect: { id: marketId } },
      },
    });
  }

  async getLots(marketId: string, userId: string, userRole: Role) {
    if (userRole === Role.LANDLORD) {
      const market = await this.prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!market) {
        throw new NotFoundException('Market not found');
      }

      if (market.ownerId !== userId) {
        throw new ForbiddenException('You do not have permission to access these lots');
      }
    }

    return this.prisma.lot.findMany({
      where: { marketId },
    });
  }

  async getLotById(id: string, userId: string, userRole: Role) {
    const lot = await this.prisma.lot.findUnique({
      where: { id },
      include: { market: true },
    });

    if (!lot) {
      throw new NotFoundException('Lot not found');
    }

    if (userRole === Role.LANDLORD && lot.market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to access this lot');
    }

    return lot;
  }

  async updateLot(id: string, dto: UpdateLotDto, userId: string, userRole: Role) {
    const lot = await this.prisma.lot.findUnique({
      where: { id },
      include: { market: true },
    });

    if (!lot) {
      throw new NotFoundException('Lot not found');
    }

    if (userRole === Role.LANDLORD && lot.market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this lot');
    }

    return this.prisma.lot.update({
      where: { id },
      data: {
        name: dto.name,
        details: dto.details,
        price: dto.price,
        available: dto.available,
        shape: dto.shape,
        position: dto.position,
      },
    });
  }

  async deleteLot(id: string, userId: string, userRole: Role) {
    const lot = await this.prisma.lot.findUnique({
      where: { id },
      include: { market: true },
    });

    if (!lot) {
      throw new NotFoundException('Lot not found');
    }

    if (userRole === Role.LANDLORD && lot.market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this lot');
    }

    return this.prisma.lot.delete({
      where: { id },
    });
  }
}