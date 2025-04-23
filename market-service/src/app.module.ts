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
import { PaymentCron } from './payment/payment.cron';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [LotModule, HttpModule, MarketModule, NotificationModule, ScheduleModule.forRoot(), MulterModule.register({
    dest: './uploads', // Temporary upload directory
  })],
  controllers: [MarketController, BookingController],
  providers: [MarketService, PrismaService, BookingService, PaymentCron, InitialMarketTagsService],
})
export class AppModule {}