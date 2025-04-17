import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BookingService } from './booking.service';

@Injectable()
export class BookingArchiveService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => BookingService))
    private bookingService: BookingService
  ) {}

  @Cron('0 0 * * *') // Runs daily at midnight
  async autoArchiveCompletedBookings() {
    const now = new Date();
    
    // Archive all APPROVED/CANCELLED bookings that ended before today
    await this.prisma.booking.updateMany({
      where: {
        status: { in: ['APPROVED', 'CANCELLED'] },
        endDate: { lt: now },
        isArchived: false,
      },
      data: { isArchived: true },
    });
  }
}
