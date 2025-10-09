// src/tracking/tracking.module.ts
import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import ediyoruz

@Module({
  imports: [PrismaModule], // Buraya ekledik
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}