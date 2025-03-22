import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { Role } from 'src/market/enum/role.enum';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async requestBooking(tenantId: string, dto: CreateBookingDto) {
    // Check if the lot exists
    const lot = await this.prisma.lot.findUnique({
      where: { id: dto.lotId },
    });

    if (!lot) {
      throw new NotFoundException('Lot not found');
    }

    // Check if the lot is available overall
  if (!lot.available) {
    throw new ForbiddenException('Lot is not available for booking');
  }

    // Check if the lot is already booked (approved) for the requested date
    const existingApprovedBooking = await this.prisma.booking.findFirst({
      where: {
        lotId: dto.lotId,
        date: dto.date,
        status: 'APPROVED',
      },
    });

    if (existingApprovedBooking) {
      throw new ForbiddenException('Lot is already booked for the selected date');
    }

    // Create the booking
    return this.prisma.booking.create({
      data: {
        tenantId,
        lotId: dto.lotId,
        status: 'PENDING',
        date: dto.date,
      },
    });
  }

  async getLandlordBookings(landlordId: string) {
    return this.prisma.booking.findMany({
      where: {
        lot: {
          market: {
            ownerId: landlordId,
          },
        },
      },
      include: { lot: true },
    });
  }


  async getBookingsByTenant(tenantId: string) {
    return this.prisma.booking.findMany({
      where: {
        tenantId,
      },
      include: {
        lot: true,
      },
    });
  }

  async updateBookingStatus(
    bookingId: string,
    status: 'APPROVED' | 'REJECTED',
    userId: string, // Add userId parameter
    userRole: Role, // Add userRole parameter
  ) {
    // Check if the user is a landlord
    if (userRole !== Role.LANDLORD) {
      throw new ForbiddenException('Only landlords can update booking status');
    }
  
    // Find the booking and include the lot and market details
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        lot: {
          include: {
            market: true, // Include market details to check ownership
          },
        },
      },
    });
  
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
  
    // Check if the landlord owns the market where the lot belongs
    if (booking.lot.market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this booking');
    }
  
    // Update the booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  
    // If the booking is approved, update the LotAvailability table
    if (status === 'APPROVED') {
      await this.prisma.lotAvailability.upsert({
        where: {
          lotId_date: {
            lotId: booking.lotId,
            date: booking.date,
          },
        },
        update: {
          available: false, // Mark the lot as unavailable
        },
        create: {
          lotId: booking.lotId,
          date: booking.date,
          available: false, // Mark the lot as unavailable
        },
      });
    }
  
    return updatedBooking;
  }

  async cancelBooking(bookingId: string, userId: string, userRole: Role) {
    // Find the booking and include the lot and market details
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        lot: {
          include: {
            market: true, // Include market details to check ownership
          },
        },
      },
    });
  
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
  
    // Check if the user is the tenant or the landlord
    const isTenant = booking.tenantId === userId;
    const isLandlord = userRole === Role.LANDLORD && booking.lot.market.ownerId === userId;
  
    if (!isTenant && !isLandlord) {
      throw new ForbiddenException('You do not have permission to cancel this booking');
    }
  
    // Update the booking status to CANCELLED
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });
  
    // If the booking was APPROVED, mark the lot as available again
    if (booking.status === 'APPROVED') {
      await this.prisma.lotAvailability.update({
        where: {
          lotId_date: {
            lotId: booking.lotId,
            date: booking.date,
          },
        },
        data: {
          available: true, // Mark the lot as available
        },
      });
    }
  
    return updatedBooking;
  }
}
