import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { InitialAdminService } from 'prisma/initial-admin.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [InitialAdminService],
})
export class AppModule {}