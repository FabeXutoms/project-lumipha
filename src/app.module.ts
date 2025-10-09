// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TrackingModule } from './tracking/tracking.module';
import { ThrottlerModule } from '@nestjs/throttler'; // İçe aktar
import { ConfigModule } from '@nestjs/config'; // İçe aktar
import { ProjectModule } from './project/project.module';
import { AppLogger } from './common/logger/logger.service';



@Module({
  imports: [
    // .env dosyasını uygulama genelinde kullanılabilir yap
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    // Rate Limiting'i kuruyoruz:
    ThrottlerModule.forRoot([{
      // 60 saniyede (süre) en fazla 10 istek (limit) izin ver.
      ttl: 60000, // 60 saniye (milisaniye cinsinden)
      limit: 10,  // Maksimum 10 istek
    }]),

    PrismaModule, 
    TrackingModule, ProjectModule
  ],
  controllers: [AppController],
  providers: [AppService, AppLogger],
})
export class AppModule {}