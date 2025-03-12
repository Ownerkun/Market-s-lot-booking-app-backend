import { Controller, Get, Post, Body, Param, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateMarketDto, UpdateMarketDto } from './dto/market.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('markets')
@UseGuards(JwtAuthGuard)
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Post()
  createMarket(@Request() req, @Body() dto: CreateMarketDto) {
    const ownerId = req.user.userId;
    return this.marketService.createMarket({ ...dto, ownerId });
  }

  @Get()
  getMarkets(@Request() req) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.marketService.getMarkets(userId, userRole);
  }

  @Get(':id')
  getMarketById(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.marketService.getMarketById(id, userId, userRole);
  }

  @Put(':id')
  updateMarket(@Request() req, @Param('id') id: string, @Body() dto: UpdateMarketDto) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.marketService.updateMarket(id, dto, userId, userRole);
  }

  @Delete(':id')
  deleteMarket(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.marketService.deleteMarket(id, userId, userRole);
  }
}