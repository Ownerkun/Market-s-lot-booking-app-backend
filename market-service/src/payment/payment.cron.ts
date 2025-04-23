// Create a new file: payment.cron.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class PaymentCron implements OnModuleInit {
  constructor(private readonly bookingService: BookingService) {}

  onModuleInit() {
    this.handleExpiredPayments();
  }

  // Run every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredPayments() {
    console.log('Checking for expired payments...');
    const result = await this.bookingService.handleExpiredPayments();
    console.log(`Processed ${result.length} expired payments`);
  }
}