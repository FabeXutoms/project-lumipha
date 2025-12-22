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

  app.set('trust proxy', 1);

  // Helmet ile gelişmiş güvenlik başlıkları ve CSP ekle
  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // 'unsafe-inline' hem scriptSrc hem de scriptSrcAttr için eklenmeli
        scriptSrc: ["'self'", "'unsafe-inline'", "https://static.cloudflareinsights.com"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "https://www.lumipha.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        connectSrc: ["'self'", "https://www.lumipha.com", "https://lumipha.com"],
      },
    },
  }));

  // Rate limit: IP başına 15 dakika içinde max 1000 istek
  app.use(require('express-rate-limit').default({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    standardHeaders: true,
    legacyHeaders: false,
    // EĞER HALA YANLIŞ IP GÖRÜYORSA BU FONKSİYONU EKLEMEK GEREKEBİLİR:
    // keyGenerator: (req) => req.ip // veya req.headers['x-forwarded-for']
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