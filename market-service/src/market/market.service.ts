import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarketDto, UpdateMarketDto } from './dto/market.dto';
import { Role } from './enum/role.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Market } from '@prisma/client';

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
        latitude: dto.latitude,
        longitude: dto.longitude,
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
        latitude: dto.latitude,
        longitude: dto.longitude,
        ownerId: dto.ownerId,
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

  haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  async findNearestMarket(userLat: number, userLon: number) {
    const markets = await this.prisma.market.findMany();

    let nearestMarket: Market | null = null; // Explicitly define the type
    let shortestDistance = Infinity;

    for (const market of markets) {
      if (market.latitude && market.longitude) {
        const distance = this.haversineDistance(userLat, userLon, market.latitude, market.longitude);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestMarket = market;
        }
      }
    }

    return nearestMarket;
  }
}