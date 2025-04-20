import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MarketService } from './market/market.service';
import { MarketController } from './market/market.controller';
import { LotModule } from './market/lot.module';
import { HttpModule } from '@nestjs/axios';
import { BookingService } from './booking/booking.service';
import { BookingController } from './booking/booking.controller';
import { MarketModule } from './market/market.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';
import { InitialMarketTagsService } from 'prisma/initial-market-tags.service';

@Module({
  imports: [LotModule, HttpModule, MarketModule, NotificationModule, ScheduleModule.forRoot()],
  controllers: [MarketController, BookingController],
  providers: [MarketService, PrismaService, BookingService, InitialMarketTagsService],
})
export class AppModule {}