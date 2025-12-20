// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TrackingModule } from './tracking/tracking.module';
import { ThrottlerModule } from '@nestjs/throttler'; // İçe aktar
import { ConfigModule } from '@nestjs/config'; // İçe aktar
import { ServeStaticModule } from '@nestjs/serve-static'; // Statik dosyalar için
import { join } from 'path';
import { ProjectModule } from './project/project.module';
import { AppLogger } from './common/logger/logger.service';
import { MailModule } from './mail/mail.module';
import { ContactModule } from './contact/contact.module';



@Module({
  imports: [
    // .env dosyasını uygulama genelinde kullanılabilir yap
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    // Statik dosyaları sun (HTML, CSS, JS, images)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..'), // Proje kök dizini
      serveRoot: '/', // Root URL'den sun
      exclude: ['/api/*', '/tracking/*', '/project/*', '/contact/*'], // API route'larını hariç tut
    }),
    
    // Rate Limiting'i kuruyoruz:
    ThrottlerModule.forRoot([{
      // 60 saniyede (süre) en fazla 20 istek (limit) izin ver.
      ttl: 60000, // 60 saniye (milisaniye cinsinden)
      limit: 20,  // Maksimum 20 istek
    }]),

    PrismaModule, 
    TrackingModule, ProjectModule, MailModule, ContactModule
  ],
  controllers: [AppController],
  providers: [AppService, AppLogger],
})
export class AppModule {}