import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingArchiveService } from './booking-archive.service';

@Module({
  providers: [
    BookingService,
    BookingArchiveService,
  ],
})
export class BookingModule {}