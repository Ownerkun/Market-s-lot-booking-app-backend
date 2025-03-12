import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarketDto, UpdateMarketDto } from './dto/market.dto';
import { Role } from './enum/role.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async validateOwnerId(ownerId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://auth-service/auth/validate-user/${ownerId}`),
      );
      return response.data.valid;
    } catch (error) {
      throw new ForbiddenException('Invalid ownerId');
    }
  }

  async createMarket(dto: CreateMarketDto) {
    return this.prisma.market.create({
      data: {
        name: dto.name,
        type: dto.type,
        location: dto.location,
        ownerId: dto.ownerId,
      },
    });
  }

  async getMarkets(userId: string, userRole: Role) {
    if (userRole === Role.TENANT) {
      // Tenants can see all markets
      return this.prisma.market.findMany();
    } else {
      // Owners can only see their own markets
      return this.prisma.market.findMany({
        where: { ownerId: userId },
      });
    }
  }

  async getMarketById(id: string, userId: string, userRole: Role) {
    const market = await this.prisma.market.findUnique({
      where: { id },
      include: { lots: true },
    });

    if (!market) {
      throw new NotFoundException('Market not found');
    }

    if (userRole === Role.LANDLORD && market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to access this market');
    }

    return market;
  }

  async updateMarket(id: string, dto: UpdateMarketDto, userId: string, userRole: Role) {
    const market = await this.prisma.market.findUnique({
      where: { id },
    });

    if (!market) {
      throw new NotFoundException('Market not found');
    }

    if (userRole === Role.LANDLORD && market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this market');
    }

    return this.prisma.market.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        location: dto.location,
        ownerId: dto.ownerId, // Optional for updates
      },
    });
  }

  async deleteMarket(id: string, userId: string, userRole: Role) {
    const market = await this.prisma.market.findUnique({
      where: { id },
    });

    if (!market) {
      throw new NotFoundException('Market not found');
    }

    if (userRole === Role.LANDLORD && market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this market');
    }

    return this.prisma.market.delete({
      where: { id },
    });
  }
}