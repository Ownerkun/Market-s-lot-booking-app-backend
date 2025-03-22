import { Controller, Post, Get, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../market/guards/jwt-auth.guard';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  requestBooking(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingService.requestBooking(req.user.userId, dto);
  }

  @Get('landlord')
  getLandlordBookings(@Request() req) {
    return this.bookingService.getLandlordBookings(req.user.userId);
  }

  @Put(':id/status')
  async updateBookingStatus(
    @Request() req, // Access the request object
    @Param('id') bookingId: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    const userId = req.user.userId; // Extract userId from the authenticated user
    const userRole = req.user.role; // Extract user role from the authenticated user
    return this.bookingService.updateBookingStatus(bookingId, status, userId, userRole);
  }

  @Get('tenant')
  async getBookingsByTenant(@Request() req) {
    const tenantId = req.user.userId;
    return this.bookingService.getBookingsByTenant(tenantId);
  }

  @Put(':id/cancel')
async cancelBooking(
  @Request() req,
  @Param('id') bookingId: string,
) {
  const userId = req.user.userId; // Extract userId from the authenticated user
  const userRole = req.user.role; // Extract user role from the authenticated user
  return this.bookingService.cancelBooking(bookingId, userId, userRole);
}
}
