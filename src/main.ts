// src/main.ts
// ÖNEMLİ: dotenv EN BAŞTA yüklenmeli - diğer tüm import'lardan önce!
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger.service'; // Logger'ı import et
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter'; // Filter'ı import et
import { NestExpressApplication } from '@nestjs/platform-express'; // Bunu ekle
import { join } from 'path'; // Bunu ekle

async function bootstrap() {
  // Logger'ı NestJS'in kendi logger'ı olarak kullanıyoruz
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Public klasörünü statik dosyalar olarak servis et
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.enableCors({
    origin: [
      'https://lumipha.com',
      'https://www.lumipha.com',
      'http://localhost:3000', // Geliştirme ortamı için
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const logger = app.get(AppLogger); // Logger servisini al
  app.useLogger(logger); // Uygulama genelinde logger'ı ayarla

  // Global Exception Filter'ı uygula
  app.useGlobalFilters(new HttpExceptionFilter(logger)); 
  
  await app.listen(3000); 
}
bootstrap();