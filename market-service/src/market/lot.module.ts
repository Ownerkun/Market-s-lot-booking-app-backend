import { Module } from '@nestjs/common';
import { LotController } from './lot.controller';
import { LotService } from './lot.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { BookingService } from 'src/booking/booking.service';

@Module({
  imports: [HttpModule],
  controllers: [LotController],
  providers: [LotService, BookingService, PrismaService],
})
export class LotModule {}