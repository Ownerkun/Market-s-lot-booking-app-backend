import { Controller, Get, Post, Body, Param, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { LotService } from './lot.service';
import { CreateLotDto, UpdateLotDto } from './dto/market.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('markets/:marketId/lots')
@UseGuards(JwtAuthGuard)
export class LotController {
  constructor(private lotService: LotService) {}

  @Post()
  createLot(@Request() req, @Param('marketId') marketId: string, @Body() dto: CreateLotDto) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.lotService.createLot(marketId, dto, userId, userRole);
  }

  @Get()
  getLots(@Request() req, @Param('marketId') marketId: string) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.lotService.getLots(marketId, userId, userRole);
  }

  @Get(':id')
  getLotById(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.lotService.getLotById(id, userId, userRole);
  }

  @Put(':id')
  updateLot(@Request() req, @Param('id') id: string, @Body() dto: UpdateLotDto) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.lotService.updateLot(id, dto, userId, userRole);
  }

  @Delete(':id')
  deleteLot(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.lotService.deleteLot(id, userId, userRole);
  }
}