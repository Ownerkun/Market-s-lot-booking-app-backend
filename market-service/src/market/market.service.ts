import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarketDto, UpdateMarketDto, CreateMarketTagDto, UpdateMarketTagDto} from './dto/market.dto';
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
    // First create the market
    const marketData: any = {
      name: dto.name,
      location: dto.location,
      latitude: dto.latitude,
      longitude: dto.longitude,
      ownerId: dto.ownerId,
    };
  
    // Only add tags if they exist
    if (dto.tagIds && dto.tagIds.length > 0) {
      // Verify all tags exist
      const existingTags = await this.prisma.marketTag.findMany({
        where: { id: { in: dto.tagIds } },
      });
  
      if (existingTags.length !== dto.tagIds.length) {
        throw new NotFoundException('One or more tags not found');
      }
  
      marketData.tags = {
        connect: dto.tagIds.map(id => ({ id }))
      };
    }
  
    const market = await this.prisma.market.create({
      data: marketData,
      include: {
        tags: true,
      },
    });
  
    return market;
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

  async updateMarket(
    id: string, 
    dto: UpdateMarketDto, 
    userId: string, 
    userRole: Role
  ) {
    const market = await this.prisma.market.findUnique({
      where: { id },
      include: { tags: true }, // Include current tags
    });
  
    if (!market) {
      throw new NotFoundException('Market not found');
    }
  
    if (userRole === Role.LANDLORD && market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this market');
    }
  
    // First update the basic market info
    const updatedMarket = await this.prisma.market.update({
      where: { id },
      data: {
        name: dto.name,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        ownerId: dto.ownerId,
        // Don't update tags here - we'll handle them separately
      },
    });
  
    // If tagIds are provided in the DTO, update the tags
    if (dto.tagIds) {
      await this.assignTagsToMarket(id, dto.tagIds);
    }
  
    // Return the market with updated tags
    return this.prisma.market.findUnique({
      where: { id },
      include: {
        tags: true, // Include tags in the response
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

  async createTag(dto: CreateMarketTagDto) {
    return this.prisma.marketTag.create({
      data: {
        name: dto.name,
        isSystem: false,
      },
    });
  }

  async getTags() {
    return this.prisma.marketTag.findMany();
  }

  async updateTag(id: string, dto: UpdateMarketTagDto) {
    return this.prisma.marketTag.update({
      where: { id },
      data: dto,
    });
  }
  
  async deleteTag(id: string) {
    const tag = await this.prisma.marketTag.findUnique({
      where: { id },
    });
  
    if (tag?.isSystem) {
      throw new ForbiddenException('Cannot delete system tags');
    }
  
    return this.prisma.marketTag.delete({
      where: { id },
    });
  }
  
  // Update the assignTagsToMarket method to handle tag assignment:
async assignTagsToMarket(marketId: string, tagIds: string[]) {
  // First verify the market exists
  const market = await this.prisma.market.findUnique({
    where: { id: marketId },
  });
  
  if (!market) {
    throw new NotFoundException('Market not found');
  }

  // Clear existing tags and assign new ones in a transaction
  return this.prisma.$transaction([
    this.prisma.market.update({
      where: { id: marketId },
      data: {
        tags: {
          set: [], // Clear all existing tags
        },
      },
    }),
    this.prisma.market.update({
      where: { id: marketId },
      data: {
        tags: {
          connect: tagIds.map(id => ({ id })), // Connect new tags
        },
      },
      include: {
        tags: true, // Include tags in the response
      },
    }),
  ]).then((results) => results[1]); // Return the second result (with tags)
}
}