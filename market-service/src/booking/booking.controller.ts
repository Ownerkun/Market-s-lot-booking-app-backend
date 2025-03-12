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
  updateBookingStatus(@Request() req, @Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingService.updateBookingStatus(req.user.userId, id, dto);
  }
}
