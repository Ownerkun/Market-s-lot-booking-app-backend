import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async requestBooking(tenantId: string, dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        tenantId,
        lotId: dto.lotId,
        status: 'PENDING',
      },
    });
  }

  async getLandlordBookings(landlordId: string) {
    return this.prisma.booking.findMany({
      where: {
        lot: {
          market: {
            ownerId: landlordId, // Assuming Market has an `ownerId` field
          },
        },
      },
      include: { lot: true},
    });
  }

  async updateBookingStatus(landlordId: string, bookingId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { lot: { include: { market: true } } },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.lot.market.ownerId !== landlordId) throw new ForbiddenException('Not your market');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: dto.status },
    });
  }
}
