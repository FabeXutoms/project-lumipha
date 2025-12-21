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

  // Helmet ile gelişmiş güvenlik başlıkları ve CSP ekle
  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://static.cloudflareinsights.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://www.lumipha.com"], // API istekleri için önemli
      },
    },
  }));

  // Rate limit: IP başına 15 dakika içinde max 1000 istek
  app.use(require('express-rate-limit').default({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 1000, // Her IP için max 1000 istek
    standardHeaders: true, // RateLimit-* başlıklarını ekle
    legacyHeaders: false, // X-RateLimit-* başlıklarını kaldır
  }));


  app.enableCors({
    origin: [
      'https://lumipha.com',
      'https://www.lumipha.com',
      'https://admin.lumipha.com',
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