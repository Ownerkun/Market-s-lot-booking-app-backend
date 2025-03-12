import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MarketService } from './market/market.service';
import { MarketController } from './market/market.controller';
import { LotModule } from './market/lot.module';
import { HttpModule } from '@nestjs/axios';
import { BookingService } from './booking/booking.service';
import { BookingController } from './booking/booking.controller';

@Module({
  imports: [LotModule, HttpModule],
  controllers: [MarketController, BookingController],
  providers: [MarketService, PrismaService, BookingService],
})
export class AppModule {}