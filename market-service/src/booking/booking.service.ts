import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { Role } from 'src/market/enum/role.enum';
import { NotificationService } from '../notification/notification.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private httpService: HttpService
  ) {}

  private getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  private async getUserFromAuthService(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://auth-service/auth/profile/${userId}`, {
          timeout: 5000 // 5 second timeout
        })
      );
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('User not found');
      }
      throw new Error('Failed to fetch user from auth service');
    }
  }

  async getLotAvailabilityForMonth(lotId: string, month: number, year: number) {
    // First, check if the lot exists and is generally available
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
    });

    if (!lot) {
      throw new NotFoundException('Lot not found');
    }

    if (!lot.available) {
      return { available: false, bookedDates: [] };
    }

    // Calculate start and end dates for the requested month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    // Get all approved bookings for the lot in the given month
    const approvedBookings = await this.prisma.booking.findMany({
      where: {
        lotId: lotId,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
            status: 'APPROVED',
          }
        ],
      },
    });
    
    // Get all dates that are booked in this month
    const bookedDates: Date[] = [];
    for (const booking of approvedBookings) {
      const dates = this.getDatesBetween(
        booking.startDate < startDate ? startDate : booking.startDate,
        booking.endDate > endDate ? endDate : booking.endDate
      );
      bookedDates.push(...dates);
    }
    
    // Get all lotAvailability entries for the lot in the given month
    const lotAvailabilities = await this.prisma.lotAvailability.findMany({
      where: {
        lotId: lotId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    const unavailableDates = lotAvailabilities
      .filter(la => !la.available)
      .map(la => la.date);
    
    // Combine both sources of unavailability
    const allUnavailableDates = [...new Set([...bookedDates, ...unavailableDates])];

    const pendingDates = (await this.getPendingDatesForLot(lotId, month, year)).pendingDates;
    
    return {
      available: lot.available,
      bookedDates: allUnavailableDates,
      pendingDates: pendingDates,
    };
  }

  async checkLotAvailability(lotId: string, startDate: Date, endDate: Date) {
    // Validate date range
    if (startDate > endDate) {
      throw new BadRequestException('End date must not be before start date');
    }

    // Check if the lot exists
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
    });
  
    if (!lot) {
      throw new NotFoundException('Lot not found');
    }
  
    if (!lot.available) {
      return { available: false };
    }
  
    // For one-day bookings, we need to check if there are any bookings that overlap with the entire day
    const dayStart = new Date(startDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(endDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Check for any approved bookings that overlap
    const overlappingApprovedBookings = await this.prisma.booking.findMany({
      where: {
        lotId: lotId,
        status: 'APPROVED',
        OR: [
          {
            startDate: { gte: dayStart, lte: dayEnd },
          },
          {
            endDate: { gte: dayStart, lte: dayEnd },
          },
          {
            startDate: { lte: dayStart },
            endDate: { gte: dayEnd },
          },
        ],
      },
    });
  
    if (overlappingApprovedBookings.length > 0) {
      return { available: false };
    }
  
    // Check for any pending bookings that overlap
    const overlappingPendingBookings = await this.prisma.booking.findMany({
      where: {
        lotId: lotId,
        status: 'PENDING',
        OR: [
          {
            startDate: { gte: startDate, lte: endDate },
          },
          {
            endDate: { gte: startDate, lte: endDate },
          },
          {
            startDate: { lte: startDate },
            endDate: { gte: endDate },
          },
        ],
      },
    });
  
    if (overlappingPendingBookings.length > 0) {
      return { 
        available: false,
        reason: 'There are pending bookings for this period'
      };
    }
  
    return { available: true };
  }

  async requestBooking(tenantId: string, dto: CreateBookingDto) {
    // Handle one-day booking
    if (dto.isOneDay) {
      dto.endDate = new Date(dto.startDate);
      dto.endDate.setHours(23, 59, 59, 999); // Set to end of the same day
    }

    // Validate the period (end date must be after or equal to start date for one-day bookings)
    if (!dto.isOneDay && dto.endDate <= dto.startDate) {
      throw new BadRequestException('End date must be after start date for multi-day bookings');
    }

    // Check if the lot exists
    const lot = await this.prisma.lot.findUnique({
      where: { id: dto.lotId },
      include: { market: true },
    });
  
    if (!lot) {
      throw new NotFoundException('Lot not found');
    }
  
    // Check if the lot is available overall
    if (!lot.available) {
      throw new ForbiddenException('Lot is not available for booking');
    }
  
    // Check availability for the entire period
    const availability = await this.checkLotAvailability(
      dto.lotId, 
      dto.startDate, 
      dto.endDate
    );

    if (!availability.available) {
      throw new ForbiddenException(
        availability.reason || 'Lot is not available for the selected period'
      );
    }

    // Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        tenantId,
        lotId: dto.lotId,
        status: 'PENDING',
        startDate: dto.startDate,
        endDate: dto.endDate,
        isOneDay: dto.isOneDay || false,
      },
    });

    // Fetch tenant and lot details for notification
    const tenant = await this.getUserFromAuthService(tenantId);
    const lotDetails = await this.prisma.lot.findUnique({ 
      where: { id: dto.lotId },
      include: { market: true }
    });

    if (!lotDetails) {
      throw new NotFoundException('Lot details not found');
    }
    
    // Send notification to landlord
    await this.notificationService.sendNotification({
      userId: lotDetails.market.ownerId as string,
      title: 'New Booking Request',
      body: `${tenant.firstName} requested to book ${lotDetails.name}`,
      data: { 
        type: 'BOOKING_REQUEST',
        bookingId: booking.id,
        lotId: lotDetails.id
      }
    });
    
    return booking;
  }

  async getLandlordBookings(landlordId: string, includeArchived = false) {
    const now = new Date();
    
    return this.prisma.booking.findMany({
      where: {
        lot: {
          market: {
            ownerId: landlordId,
          },
        },
        AND: [
          {
            OR: [
              { isArchived: includeArchived ? undefined : false },
              { isArchived: includeArchived ? true : undefined },
            ],
          },
          {
            OR: [
              { status: 'PENDING' },
              { 
                AND: [
                  { status: { in: ['APPROVED', 'CANCELLED'] } },
                  { endDate: { gte: now } },
                ]
              },
              {
                AND: [
                  { status: { in: ['APPROVED', 'CANCELLED'] } },
                  { endDate: { lt: now } },
                  { isArchived: false },
                ]
              }
            ]
          }
        ]
      },
      include: { 
        lot: {
          include: {
            market: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async getBookingsByTenant(tenantId: string) {
    return this.prisma.booking.findMany({
      where: {
        tenantId,
      },
      include: {
        lot: {
          include: {
            market: true,
          },
        }
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async updateBookingStatus(
    bookingId: string,
    status: 'APPROVED' | 'REJECTED',
    userId: string,
    userRole: Role,
    reason?: string
  ) {
    // Check if the user is a landlord
    if (userRole !== Role.LANDLORD) {
      throw new ForbiddenException('Only landlords can update booking status');
    }
  
    // Find the booking with all necessary relations
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        lot: {
          include: {
            market: true,
          },
        },
      },
    });
  
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
  
    // Check if the booking is in PENDING status
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be approved or rejected');
    }
  
    // Check if the landlord owns the market
    if (booking.lot.market.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this booking');
    }
  
    // Update the booking status and include lot details in the same query
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status,
        rejectionReason: status === 'REJECTED' ? reason : null 
      },
      include: {
        lot: true
      }
    });
  
    // Send notification to tenant
    try {
      await this.notificationService.sendNotification({
        userId: updatedBooking.tenantId,
        title: `Booking ${status.toLowerCase()}`,
        body: `Your booking for ${updatedBooking.lot.name} has been ${status.toLowerCase()}`,
        data: { 
          type: 'BOOKING_STATUS_UPDATE',
          bookingId: updatedBooking.id,
          status: status
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Continue even if notification fails
    }
  
    // Handle LotAvailability updates
    const datesInPeriod = this.getDatesBetween(
      booking.startDate, 
      booking.endDate
    );
  
    await this.prisma.$transaction(
      datesInPeriod.map(date => 
        this.prisma.lotAvailability.upsert({
          where: {
            lotId_date: {
              lotId: booking.lotId,
              date: date,
            },
          },
          update: { 
            available: status === 'REJECTED'
          },
          create: {
            lotId: booking.lotId,
            date: date,
            available: status === 'REJECTED',
          },
        })
      )
    );
  
    return updatedBooking;
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    userRole: Role,
    reason?: string
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        lot: {
          include: {
            market: true,
          },
        },
      },
    });
  
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
  
    const isTenant = userRole === Role.TENANT && booking.tenantId === userId;
    const isMarketOwner = userRole === Role.LANDLORD && booking.lot.market.ownerId === userId;
  
    if (!isTenant && !isMarketOwner) {
      throw new ForbiddenException('Only the booking creator or market owner can cancel bookings');
    }
  
    if (!['PENDING', 'APPROVED'].includes(booking.status)) {
      throw new BadRequestException('Only pending or approved bookings can be cancelled');
    }
  
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'CANCELLED',
        rejectionReason: reason
      },
    });
  
    if (booking.status === 'APPROVED') {
      const datesInPeriod = this.getDatesBetween(
        booking.startDate, 
        booking.endDate
      );
  
      await this.prisma.$transaction(
        datesInPeriod.map(date => 
          this.prisma.lotAvailability.upsert({
            where: {
              lotId_date: {
                lotId: booking.lotId,
                date: date,
              },
            },
            update: { available: true },
            create: {
              lotId: booking.lotId,
              date: date,
              available: true,
            },
          })
        )
      );
    }
  
    return updatedBooking;
  }

  async getPendingDatesForLot(lotId: string, month: number, year: number) {
    // First, check if the lot exists
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
    });
  
    if (!lot) {
      throw new NotFoundException('Lot not found');
    }
  
    // Calculate start and end dates for the requested month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    // Get all pending bookings for the lot in the given month
    const pendingBookings = await this.prisma.booking.findMany({
      where: {
        lotId: lotId,
        status: 'PENDING',
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          }
        ],
      },
    });
    
    // Get all dates that are pending in this month
    const pendingDates: Date[] = [];
    for (const booking of pendingBookings) {
      const dates = this.getDatesBetween(
        booking.startDate < startDate ? startDate : booking.startDate,
        booking.endDate > endDate ? endDate : booking.endDate
      );
      pendingDates.push(...dates);
    }
    
    return {
      pendingDates: [...new Set(pendingDates)], // Remove duplicates
    };
  }

  async archiveBooking(
    bookingId: string,
    userId: string,
    userRole: Role,
    isArchived: boolean
  ) {
    // Find the booking with related data
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        lot: {
          include: {
            market: true,
          },
        },
      },
    });
  
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
  
    // Check permissions - only landlord who owns the market can archive
    if (!(userRole === Role.LANDLORD && booking.lot.market.ownerId === userId)) {
      throw new ForbiddenException('Only the market owner can archive bookings');
    }
  
    // Can only archive APPROVED or CANCELLED bookings
    if (booking.status === 'PENDING') {
      throw new BadRequestException('Pending bookings cannot be archived');
    }
  
    // Update the archive status
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { isArchived },
    });
  }
}