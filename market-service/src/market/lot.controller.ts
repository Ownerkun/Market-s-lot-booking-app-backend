import { Controller, Get, Post, Body, Param, Put, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { LotService } from './lot.service';
import { BookingService } from '../booking/booking.service';
import { CreateLotDto, UpdateLotDto } from './dto/market.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Role } from './enum/role.enum';

@Controller('lots')
@UseGuards(JwtAuthGuard)
export class LotController {
  constructor(
    private lotService: LotService,
    private bookingService: BookingService, // Inject BookingService
  ) {}

  @Post()
async createLot(@Request() req, @Body() dto: CreateLotDto) {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const marketId = dto.marketId; // Ensure marketId is included in the DTO
  return this.lotService.createLot(marketId, dto, userId, userRole);
}

  @Get()
async getLots(@Request() req, @Query('marketId') marketId: string) {
  const userId = req.user.userId;
  const userRole = req.user.role;
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

  @Get(':id/availability')
  async checkAvailability(@Param('id') id: string, @Query('date') date: string) {
    const parsedDate = new Date(date);
    return this.lotService.checkAvailability(id, parsedDate);
  }

  @Post(':id/book')
async bookLot(
  @Request() req, 
  @Param('id') id: string,
  @Body() body: { date: string } | { startDate: string, endDate: string }
) {
  const tenantId = req.user.userId;
  
  if ('date' in body) {
    // Single date booking
    const parsedDate = new Date(body.date);
    return this.bookingService.requestBooking(tenantId, {
      lotId: id,
      startDate: parsedDate,
      endDate: parsedDate
    });
  } else {
    // Date range booking
    return this.bookingService.requestBooking(tenantId, {
      lotId: id,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate)
    });
  }
}
}