import { Controller, Post, Get, Put, Param, Body, Request, UseGuards, Query, BadRequestException, UseInterceptors, UploadedFile, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../market/guards/jwt-auth.guard';
import { CreateBookingDto, UpdateBookingStatusDto, ArchiveBookingDto } from './dto/booking.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmitPaymentDto, VerifyPaymentDto } from 'src/payment/payment.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  requestBooking(
    @Request() req,
    @Body() dto: CreateBookingDto
  ) {
    return this.bookingService.requestBooking(req.user.userId, dto);
  }

  @Get('landlord')
  getLandlordBookings(
    @Request() req,
    @Query('includeArchived') includeArchived?: boolean
  ) {
    return this.bookingService.getLandlordBookings(
      req.user.userId,
      includeArchived
    );
  }

  @Put(':id/status')
  async updateBookingStatus(
    @Request() req,
    @Param('id') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,  // Changed to use DTO
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.bookingService.updateBookingStatus(
      bookingId, 
      dto.status,
      userId, 
      userRole,
      dto.reason
    );
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
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.bookingService.cancelBooking(
      bookingId, 
      userId, 
      userRole
    );
  }

  @Get(':lotId/availability')
  async checkLotAvailability(
    @Param('lotId') lotId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Validate dates
    if (isNaN(parsedStartDate.getTime())) {
      throw new BadRequestException('Invalid start date');
    }
    if (isNaN(parsedEndDate.getTime())) {
      throw new BadRequestException('Invalid end date');
    }
    if (parsedEndDate <= parsedStartDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.bookingService.checkLotAvailability(
      lotId, 
      parsedStartDate, 
      parsedEndDate
    );
  }

  @Get('lots/:lotId/availability-month')
  async getLotAvailabilityForMonth(
    @Param('lotId') lotId: string,
    @Query('month') month: number,
    @Query('year') year: number
  ) {
    // Validate month and year
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('Year must be between 2000 and 2100');
    }

    return this.bookingService.getLotAvailabilityForMonth(
      lotId, 
      month, 
      year
    );
  }

  @Get('lots/:lotId/pending-dates')
  async getPendingDatesForLot(
    @Param('lotId') lotId: string,
    @Query('month') month: number,
    @Query('year') year: number
  ) {
    // Validate month and year
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('Year must be between 2000 and 2100');
    }

    return this.bookingService.getPendingDatesForLot(
      lotId, 
      month, 
      year
    );
  }

  @Put(':id/archive')
  async archiveBooking(
    @Request() req,
    @Param('id') bookingId: string,
    @Body() dto: ArchiveBookingDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.bookingService.archiveBooking(
      bookingId, 
      userId, 
      userRole,
      dto.isArchived
    );
  }

  @Post(':id/payment')
  @UseInterceptors(FileInterceptor('paymentProof'))
  async submitPayment(
    @Request() req,
    @Param('id') bookingId: string,
    @Body() dto: SubmitPaymentDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Payment proof file is required');
    }
    return this.bookingService.submitPayment(
      req.user.userId,
      bookingId,
      dto,
      file
    );
  }

  @Put(':id/verify-payment')
  async verifyPayment(
    @Request() req,
    @Param('id') bookingId: string,
    @Body() dto: VerifyPaymentDto
  ) {
    return this.bookingService.verifyPayment(
      req.user.userId,
      req.user.role,
      bookingId,
      dto
    );
  }

  @Get('payment-due')
  async getPaymentDueBookings(@Request() req) {
    return this.bookingService.getPaymentDueBookings(req.user.userId);
  }
}