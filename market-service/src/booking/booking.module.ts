import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingArchiveService } from './booking-archive.service';
import { HttpModule } from '@nestjs/axios';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [HttpModule, NotificationModule],
  providers: [
    BookingService,
    BookingArchiveService,
  ],
  exports: [
    BookingService,
    BookingArchiveService,
  ],

})
export class BookingModule {}