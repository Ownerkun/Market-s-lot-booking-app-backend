import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategies';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Use same secret as auth-service
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [MarketController],
  providers: [MarketService, JwtAuthGuard, JwtStrategy],
})
export class MarketModule {}