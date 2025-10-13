// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger.service'; // Logger'ı import et
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter'; // Filter'ı import et

async function bootstrap() {
  // Logger'ı NestJS'in kendi logger'ı olarak kullanıyoruz
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLogger); // Logger servisini al
  app.useLogger(logger); // Uygulama genelinde logger'ı ayarla

  // Global Exception Filter'ı uygula
  app.useGlobalFilters(new HttpExceptionFilter(logger)); 
  
  await app.listen(3000); 
}
bootstrap();